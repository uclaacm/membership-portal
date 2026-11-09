import 'jest';

import { DeleteEvent, Events } from 'reducers/events';
import { DeleteImage, Images } from 'reducers/image';

const makeJsonResponse = (status, body) => ({
  status,
  json: () => Promise.resolve(body),
});

describe('Control panel delete permission handling', () => {
  afterEach(() => {
    global.fetch = undefined;
    jest.clearAllMocks();
  });

  test('DeleteEvent 403 dispatches permission error and does not dispatch logout thunk', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      makeJsonResponse(403, { error: { message: 'You do not have permission to delete this event.' } }),
    );

    const dispatch = jest.fn();
    await DeleteEvent('event-uuid')(dispatch);

    expect(dispatch).not.toHaveBeenCalledWith(expect.any(Function));

    const errorAction = dispatch.mock.calls
      .map(call => call[0])
      .find(action => action && action.error);

    expect(errorAction).toBeDefined();
    expect(errorAction.error).toMatch(/permission/i);

    const nextState = Events(undefined, errorAction);
    expect(nextState.get('deleteSuccess')).toBe(false);
    expect(nextState.get('deleteError')).toMatch(/permission/i);
  });

  test('DeleteImage 403 dispatches permission error and does not dispatch logout thunk', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      makeJsonResponse(403, { error: { message: 'You do not have permission to delete this image.' } }),
    );

    const dispatch = jest.fn();
    await DeleteImage('image-uuid')(dispatch);

    expect(dispatch).not.toHaveBeenCalledWith(expect.any(Function));

    const errorAction = dispatch.mock.calls
      .map(call => call[0])
      .find(action => action && action.error);

    expect(errorAction).toBeDefined();
    expect(errorAction.error).toMatch(/permission/i);

    const nextState = Images(undefined, errorAction);
    expect(nextState.get('deleteSuccess')).toBe(false);
    expect(nextState.get('deleteError')).toMatch(/permission/i);
  });
});
