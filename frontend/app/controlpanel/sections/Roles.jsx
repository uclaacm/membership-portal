'use client';

import PropTypes from 'prop-types';
import DataTable from '../components/DataTable';
import {
  PageHeader, SectionHead, Pill, TagGroup, Dagger, ApiLegend,
} from '../components/primitives';
import { formatDate, formatRelative } from '../format';

const levelTone = (level) => {
  if (level === 'Super admin') return 'superadmin';
  if (level === 'Dev Team') return 'admin';
  return 'muted';
};

export default function Roles({
  admins, officers, canManageAdmins, onOpenAssign, onRevoke,
}) {
  const adminColumns = [
    {
      key: 'name',
      label: 'Name',
      cellClassName: 'identifier',
      render: (user) => (
        <span className="cp-avatar-cell">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="cp-avatar" src={user.picture || '/unknown.png'} alt="" />
          {user.firstName} {user.lastName}
        </span>
      ),
    },
    { key: 'email', label: 'Email', render: (user) => user.email },
    {
      key: 'level',
      label: 'Level',
      render: (user) => <Pill tone={levelTone(user.level)}>{user.level}</Pill>,
    },
    {
      key: 'grantedBy',
      label: <>Granted by <Dagger /></>,
      render: (user) => user.roleGrantedBy || '—',
    },
    {
      key: 'grantedOn',
      label: <>Granted on <Dagger /></>,
      render: (user) => formatDate(user.roleGrantedAt),
    },
    {
      key: 'lastActive',
      label: <>Last active <Dagger /></>,
      render: (user) => formatRelative(user.lastActiveAt),
    },
    {
      key: 'actions',
      label: '',
      cellClassName: 'cp-row-actions',
      render: (user) => (
        // A super admin cannot be revoked from here — the role must be reassigned first, so
        // the chapter is never left without one.
        user.accessType === 'SUPERADMIN' ? <span style={{ color: '#979797' }}>—</span> : (
          <button
            type="button"
            className="destructive"
            onClick={() => onRevoke(user, 'admin')}
            disabled={!canManageAdmins}
          >
            Revoke
          </button>
        )
      ),
    },
  ];

  const officerColumns = [
    {
      key: 'name',
      label: 'Name',
      cellClassName: 'identifier',
      render: (user) => (
        <span className="cp-avatar-cell">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="cp-avatar" src={user.picture || '/unknown.png'} alt="" />
          {user.firstName} {user.lastName}
        </span>
      ),
    },
    { key: 'email', label: 'Email', render: (user) => user.email },
    {
      key: 'committees',
      label: 'Committees',
      render: (user) => <TagGroup items={user.committees} />,
    },
    { key: 'position', label: 'Position', render: (user) => user.position || 'Officer' },
    {
      key: 'since',
      label: <>Since <Dagger /></>,
      render: (user) => formatDate(user.roleGrantedAt),
    },
    {
      key: 'actions',
      label: '',
      cellClassName: 'cp-row-actions',
      render: (user) => (
        <>
          <button type="button" className="secondary" onClick={() => onOpenAssign('Officer', user)}>
            Edit
          </button>
          <button type="button" className="destructive" onClick={() => onRevoke(user, 'officer')}>
            Remove
          </button>
        </>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Admins & Officers"
        subtitle="Who has elevated access, and what they can reach."
      />

      <div className="cp-stack">
        <div>
          <SectionHead title="Admins" count={admins.length}>
            <button
              type="button"
              className="cp-btn primary small"
              onClick={() => onOpenAssign('Admin')}
              disabled={!canManageAdmins}
            >
              + Add admin
            </button>
          </SectionHead>
          <DataTable
            columns={adminColumns}
            rows={admins}
            rowKey={(user) => user.uuid}
            empty="No admins found."
          />
        </div>

        <div>
          <SectionHead title="Officers" count={officers.length}>
            <button type="button" className="cp-btn secondary small" onClick={() => onOpenAssign('Officer')}>
              + Add officer
            </button>
          </SectionHead>
          <DataTable
            columns={officerColumns}
            rows={officers}
            rowKey={(user) => user.uuid}
            empty="No officers assigned yet."
          />
        </div>
      </div>

      <ApiLegend />
    </>
  );
}

Roles.propTypes = {
  admins: PropTypes.arrayOf(PropTypes.object).isRequired,
  officers: PropTypes.arrayOf(PropTypes.object).isRequired,
  canManageAdmins: PropTypes.bool.isRequired,
  onOpenAssign: PropTypes.func.isRequired,
  onRevoke: PropTypes.func.isRequired,
};
