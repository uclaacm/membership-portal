'use client';

import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import Config from '@/lib/config';
import DataTable from '../components/DataTable';
import {
  PageHeader, Pill, TagGroup, Dagger, ApiLegend, SearchField, Select,
} from '../components/primitives';
import {
  formatCount, formatDate, formatRelative, formatYear,
} from '../format';

const ROLE_TONE = { Admin: 'admin', Officer: 'officer', Member: 'member' };

const ROLE_OPTIONS = [
  { value: '', label: 'All roles' },
  { value: 'Member', label: 'Member' },
  { value: 'Officer', label: 'Officer' },
  { value: 'Admin', label: 'Admin' },
];

const escapeCsv = (value) => {
  const text = value === null || value === undefined ? '' : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

export default function Users({
  data, filters, canManageRoles, onFiltersChange, onAssignRole, onEditUser, onViewUser,
  onAssignCommittee, onBulkAdd,
}) {
  const {
    users, memberTotal, page, pages, limit,
  } = data;
  const [selected, setSelected] = useState({});

  const committeeOptions = useMemo(() => [
    { value: '', label: 'All committees' },
    ...Config.committees.map((c) => ({ value: c, label: c })),
  ], []);

  const selectedUuids = Object.keys(selected).filter((uuid) => selected[uuid]);
  const allOnPageSelected = users.length > 0 && users.every((u) => selected[u.uuid]);

  const toggleAll = () => {
    if (allOnPageSelected) {
      setSelected({});
      return;
    }
    setSelected(Object.fromEntries(users.map((u) => [u.uuid, true])));
  };

  const toggleOne = (uuid) => setSelected((current) => ({ ...current, [uuid]: !current[uuid] }));

  const exportCsv = () => {
    const header = ['Name', 'Email', 'Role', 'Committees', 'Year', 'Major', 'Points', 'Joined', 'Last active'];
    const lines = users.map((u) => [
      `${u.firstName} ${u.lastName}`,
      u.email,
      u.role,
      (u.committees || []).join(' / '),
      formatYear(u.year),
      u.major,
      u.points,
      formatDate(u.joinedAt),
      formatRelative(u.lastActiveAt),
    ].map(escapeCsv).join(','));

    const blob = new Blob([[header.join(','), ...lines].join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `acm-members-page-${page}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Bulk role changes run sequentially and the selection is cleared once, after all of them
  // settle, so a partial failure still leaves the table consistent with the server.
  const bulkAssign = async (role) => {
    await selectedUuids.reduce(
      (chain, uuid) => chain.then(() => onAssignRole({ uuid, role })),
      Promise.resolve(),
    );
    setSelected({});
  };

  const columns = [
    {
      key: 'select',
      width: '28px',
      label: (
        <input
          type="checkbox"
          checked={allOnPageSelected}
          onChange={toggleAll}
          aria-label="Select all users on this page"
        />
      ),
      render: (user) => (
        <input
          type="checkbox"
          checked={!!selected[user.uuid]}
          onChange={() => toggleOne(user.uuid)}
          aria-label={`Select ${user.firstName} ${user.lastName}`}
        />
      ),
    },
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
    {
      key: 'email',
      label: <>Email <Dagger /></>,
      // The API redacts contact details for members outside an officer's own committees, so
      // this cell reflects what was actually returned rather than hiding a value we hold.
      render: (user) => (user.email
        ? user.email
        : <span className="cp-redacted" title="Visible to admins, and to officers for their own committees">Hidden</span>),
    },
    {
      key: 'role',
      label: 'Role',
      render: (user) => <Pill tone={ROLE_TONE[user.role] || 'member'}>{user.role}</Pill>,
    },
    {
      key: 'committees',
      label: 'Committees',
      render: (user) => <TagGroup items={user.committees} />,
    },
    { key: 'year', label: 'Year', render: (user) => formatYear(user.year) },
    { key: 'major', label: 'Major', render: (user) => user.major || '—' },
    {
      key: 'points', label: 'Points', numeric: true, render: (user) => formatCount(user.points),
    },
    { key: 'joined', label: 'Joined', render: (user) => formatDate(user.joinedAt) },
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
        <>
          <button type="button" className="secondary" onClick={() => onViewUser(user)}>View</button>
          {canManageRoles && (
            <button type="button" className="primary" onClick={() => onEditUser(user)}>
              Edit role
            </button>
          )}
        </>
      ),
    },
  ];

  const firstRow = users.length === 0 ? 0 : (page - 1) * limit + 1;
  const lastRow = (page - 1) * limit + users.length;

  return (
    <>
      <PageHeader
        title="Users"
        subtitle="Every registered member, with role and committee assignments."
      />

      <div className="cp-toolbar">
        <SearchField
          value={filters.search}
          onChange={(search) => onFiltersChange({ ...filters, search, page: 1 })}
          placeholder="Search name or email"
        />
        <Select
          label="Filter by role"
          value={filters.role}
          onChange={(role) => onFiltersChange({ ...filters, role, page: 1 })}
          options={ROLE_OPTIONS}
        />
        <Select
          label="Filter by committee"
          value={filters.committee}
          onChange={(committee) => onFiltersChange({ ...filters, committee, page: 1 })}
          options={committeeOptions}
        />
        <div className="cp-toolbar-right">
          <span className="cp-toolbar-meta">{formatCount(memberTotal)} users</span>
          <button type="button" className="cp-btn secondary" onClick={exportCsv}>Export CSV</button>
          {canManageRoles && (
            <button type="button" className="cp-btn primary" onClick={onBulkAdd}>+ Add users</button>
          )}
        </div>
      </div>

      {selectedUuids.length > 0 && (
        <div className="cp-bulk-bar">
          <span className="cp-bulk-count">{selectedUuids.length} selected</span>
          {canManageRoles && (
            <>
              <button type="button" onClick={() => onAssignCommittee(selectedUuids)}>
                Assign committee
              </button>
              <button type="button" onClick={() => bulkAssign('Officer')}>Make officer</button>
              <button type="button" className="destructive" onClick={() => bulkAssign('Member')}>
                Revoke role
              </button>
            </>
          )}
          <button type="button" className="cp-bulk-clear" onClick={() => setSelected({})}>Clear</button>
        </div>
      )}

      <DataTable
        columns={columns}
        rows={users}
        rowKey={(user) => user.uuid}
        isSelected={(user) => !!selected[user.uuid]}
        empty="No members match these filters."
      />

      <div className="cp-pagination">
        <span>
          Showing {formatCount(firstRow)}–{formatCount(lastRow)} of {formatCount(memberTotal)}
        </span>
        <div className="cp-page-buttons">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onFiltersChange({ ...filters, page: page - 1 })}
          >
            Previous
          </button>
          <button
            type="button"
            disabled={page >= pages}
            onClick={() => onFiltersChange({ ...filters, page: page + 1 })}
          >
            Next
          </button>
        </div>
      </div>

      <ApiLegend />
    </>
  );
}

Users.propTypes = {
  data: PropTypes.object.isRequired,
  filters: PropTypes.object.isRequired,
  canManageRoles: PropTypes.bool.isRequired,
  onFiltersChange: PropTypes.func.isRequired,
  onAssignRole: PropTypes.func.isRequired,
  onEditUser: PropTypes.func.isRequired,
  onViewUser: PropTypes.func.isRequired,
  onAssignCommittee: PropTypes.func.isRequired,
  onBulkAdd: PropTypes.func.isRequired,
};
