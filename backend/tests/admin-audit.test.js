jest.mock('../app/logger', () => ({ error: jest.fn() }));
jest.mock('../app/db', () => ({
  User: { findByUUID: jest.fn() },
  Secret: { findByName: jest.fn(), generateHash: jest.fn() },
  AuditLog: { create: jest.fn() },
}));
jest.mock('../app/api/v1/internship/models/Committee', () => ({
  Committee: { find: jest.fn(), updateMany: jest.fn() },
}));
jest.mock('../app/api/v1/internship/models/InternshipApplication', () => ({ InternshipApplication: {} }));
jest.mock('../app/api/v1/internship/controllers/applicationController', () => ({ CHOICE_FIELDS: [] }));

const express = require('express');
const { User, Secret, AuditLog } = require('../app/db');
const { router: userRouter } = require('../app/api/v1/membership/user');
const { router: settingsRouter } = require('../app/api/v1/membership/settings');
const { Committee } = require('../app/api/v1/internship/models/Committee');
const {
  bulkUpdateCommitteeStatus,
} = require('../app/api/v1/internship/controllers/committeeController');

// Let Express run the complete route stack, including next(), short-circuits, and
// async errors. These tests use mocked JSON responses, so completion means either
// res.json() or leaving the route via next(), not merely returning from middleware.
const runAllHandlers = (router, path, method, req, res, next) => {
  const layer = router.stack.find((entry) => entry.route && entry.route.path === path);
  if (!layer) throw new Error(`No route registered for ${path}`);
  req.method = method.toUpperCase();
  return new Promise((resolve) => {
    res.json.mockImplementationOnce(() => {
      resolve();
      return res;
    });
    layer.route.dispatch(req, res, (err) => {
      next(err);
      resolve();
    });
  });
};
let req;
let res;
let next;
let target;
let config;

beforeEach(() => {
  jest.clearAllMocks();
  AuditLog.create.mockResolvedValue({});
  req = {
    user: { uuid: 'admin', isAdmin: () => true, isSuperAdmin: () => true },
    params: { uuid: 'member' },
    body: {},
  };
  res = { json: jest.fn() };
  next = jest.fn();
  target = {
    uuid: 'member',
    accessType: 'OFFICER',
    committees: ['Hack', 'AI'],
    position: 'Lead',
    isSuperAdmin: () => false,
    isAdmin: () => target.accessType === 'ADMIN',
    isOfficer: () => target.accessType === 'OFFICER',
    getRosterProfile: () => ({}),
    update: jest.fn(async (values) => Object.assign(target, values)),
  };
  User.findByUUID.mockResolvedValue(target);
  config = {
    transport: 'smtp', host: 'old.example.com', port: 587, configured: true,
  };
  Secret.findByName.mockResolvedValue({
    getDataValue: (field) => (field === 'meta' ? JSON.stringify(config) : 'PRIVATE_HASH'),
    update: jest.fn().mockResolvedValue({}),
  });
  Secret.generateHash.mockResolvedValue('NEW_PRIVATE_HASH');
});

it('records actual role and committee changes, omitting unchanged position', async () => {
  req.body = { role: 'Admin', committees: ['Hack'], position: 'Lead' };
  await runAllHandlers(userRouter, '/:uuid/role', 'patch', req, res, next);
  expect(next).not.toHaveBeenCalled();
  expect(AuditLog.create.mock.calls[0][0].detail)
    .toBe('accessType: "OFFICER" → "ADMIN"; committees: ["AI","Hack"] → ["Hack"]');
});

it('labels unchanged role requests honestly, while retaining the protected-action audit', async () => {
  req.body = { role: 'Officer', committees: ['AI', 'Hack'] };
  await runAllHandlers(userRouter, '/:uuid/role', 'patch', req, res, next);
  expect(next).not.toHaveBeenCalled();
  expect(AuditLog.create.mock.calls[0][0].detail).toBe('No role, committee, or position changes');
});

it('includes old/new scope in bulk role updates', async () => {
  req.body = { uuids: ['member'], committees: ['AI'], committeeMode: 'remove' };
  await runAllHandlers(userRouter, '/bulk', 'patch', req, res, next);
  expect(next).not.toHaveBeenCalled();
  expect(AuditLog.create.mock.calls[0][0].detail)
    .toBe('Bulk: committees: ["AI","Hack"] → ["Hack"]');
});

it('shows changed email fields without claiming the transport changed', async () => {
  req.body = { transport: 'smtp', host: 'new.example.com', port: '587' };
  await runAllHandlers(settingsRouter, '/email', 'put', req, res, next);
  expect(next).not.toHaveBeenCalled();
  expect(AuditLog.create.mock.calls[0][0].detail)
    .toBe('host: "old.example.com" → "new.example.com"');
});

it('retains a truthful audit of unchanged settings', async () => {
  req.body = { transport: 'smtp' };
  await runAllHandlers(settingsRouter, '/email', 'put', req, res, next);
  expect(next).not.toHaveBeenCalled();
  expect(AuditLog.create.mock.calls[0][0].detail).toBe('No settings changed');
});

it('never records credentials or hashes when replacing an email credential', async () => {
  req.body = { transport: 'smtp', token: 'PRIVATE_TOKEN' };
  await runAllHandlers(settingsRouter, '/email', 'put', req, res, next);
  expect(next).not.toHaveBeenCalled();
  expect(AuditLog.create.mock.calls[0][0].detail).toBe('Credential replaced (redacted)');
  expect(JSON.stringify(AuditLog.create.mock.calls)).not.toContain('PRIVATE');
});

it('only targets committees needing a status change and omits no-op audit entries', async () => {
  req.body = { action: 'open', committeeIds: ['hack'] };
  Committee.find.mockReturnValue({ select: jest.fn().mockResolvedValue([]) });
  Committee.updateMany.mockResolvedValue({ modifiedCount: 0 });
  await bulkUpdateCommitteeStatus(req, res, next);
  expect(next).not.toHaveBeenCalled();
  expect(Committee.updateMany).toHaveBeenCalledWith({
    _id: { $in: ['hack'] }, isActive: { $ne: true },
  }, { $set: { isActive: true } });
  expect(AuditLog.create).not.toHaveBeenCalled();
});

it('runs synchronous and callback-based middleware before the async controller', async () => {
  const router = express.Router();
  const calls = [];
  router.patch('/example', (request, response, proceed) => {
    calls.push('auth');
    proceed();
  }, (request, response, proceed) => {
    setImmediate(() => {
      calls.push('validation');
      proceed();
    });
  }, async (request, response) => {
    await Promise.resolve();
    calls.push('controller');
    response.json({ success: true });
  });
  await runAllHandlers(router, '/example', 'patch', req, res, next);
  expect(calls).toEqual(['auth', 'validation', 'controller']);
  expect(res.json).toHaveBeenCalledWith({ success: true });
  expect(next).not.toHaveBeenCalled();
});

it('stops when middleware sends a response', async () => {
  const router = express.Router();
  const controller = jest.fn();
  router.patch('/example', (request, response) => {
    response.json({ error: 'Forbidden' });
  }, controller);
  await runAllHandlers(router, '/example', 'patch', req, res, next);
  expect(controller).not.toHaveBeenCalled();
  expect(next).not.toHaveBeenCalled();
});

it.each(['next', 'throw', 'reject'])('forwards middleware errors via %s', async (mode) => {
  const router = express.Router();
  const controller = jest.fn();
  const failure = new Error('Unauthorized');
  router.patch('/example', (request, response, proceed) => {
    if (mode === 'throw') throw failure;
    if (mode === 'reject') return Promise.reject(failure);
    return proceed(failure);
  }, controller);
  await runAllHandlers(router, '/example', 'patch', req, res, next);
  expect(next).toHaveBeenCalledWith(failure);
  expect(controller).not.toHaveBeenCalled();
});
