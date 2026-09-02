'use client';

import PropTypes from 'prop-types';
import DataTable from '../components/DataTable';
import { PageHeader, ApiLegend, SearchField, Select } from '../components/primitives';
import { formatCount, formatTimestamp } from '../format';

// Tag palette per action, matching the design's audit tag colours.
const ACTION_TONE = {
  'role.grant': 'grant',
  'role.revoke': 'destructive',
  'event.create': 'create',
  'event.update': '',
  'event.delete': 'destructive',
  'events.sync': '',
  'media.upload': '',
  'media.delete': 'destructive',
  'settings.update': 'settings',
  'committee.open': 'create',
  'committee.close': '',
  'committee.create': 'create',
  'committee.update': '',
};

const ACTION_OPTIONS = [
  { value: 'all', label: 'All actions' },
  { value: 'role', label: 'Role changes' },
  { value: 'event', label: 'Event changes' },
  { value: 'media', label: 'Media' },
  { value: 'settings', label: 'Settings' },
  { value: 'internship', label: 'Internship' },
];

const RANGE_OPTIONS = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: 'quarter', label: 'This quarter' },
  { value: 'all', label: 'All time' },
];

const escapeCsv = (value) => {
  const text = value === null || value === undefined ? '' : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

export default function AuditLog({
  entries, total, page, pages, filters, onFiltersChange,
}) {
  const exportCsv = () => {
    const header = ['When', 'Actor', 'Email', 'Action', 'Target', 'Detail', 'IP'];
    const lines = entries.map((e) => [
      e.createdAt, e.actorName, e.actorEmail, e.action, e.target, e.detail, e.ip,
    ].map(escapeCsv).join(','));

    const blob = new Blob([[header.join(','), ...lines].join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `acm-audit-log-page-${page}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const columns = [
    {
      key: 'when', label: 'When', numeric: false, render: (e) => formatTimestamp(e.createdAt),
    },
    {
      key: 'actor',
      label: 'Actor',
      cellClassName: 'identifier',
      render: (e) => e.actorName || 'Unknown',
    },
    {
      key: 'action',
      label: 'Action',
      render: (e) => (
        <span className={`cp-action-tag ${ACTION_TONE[e.action] || ''}`}>{e.action}</span>
      ),
    },
    { key: 'target', label: 'Target', render: (e) => e.target || '—' },
    { key: 'detail', label: 'Detail', render: (e) => e.detail || '—' },
    { key: 'ip', label: 'IP', render: (e) => e.ip || '—' },
  ];

  return (
    <>
      <PageHeader
        title="Audit log"
        subtitle="Every privileged action taken in the portal."
      />

      <div className="cp-toolbar">
        <SearchField
          value={filters.search}
          onChange={(search) => onFiltersChange({ ...filters, search, page: 1 })}
          placeholder="Search actor or target"
        />
        <Select
          label="Filter by action"
          value={filters.action}
          onChange={(action) => onFiltersChange({ ...filters, action, page: 1 })}
          options={ACTION_OPTIONS}
        />
        <Select
          label="Filter by range"
          value={filters.range}
          onChange={(range) => onFiltersChange({ ...filters, range, page: 1 })}
          options={RANGE_OPTIONS}
        />
        <div className="cp-toolbar-right">
          <button type="button" className="cp-btn secondary" onClick={exportCsv}>Export CSV</button>
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={entries}
        rowKey={(e) => e.uuid}
        empty="No audit entries for this filter. Privileged actions are recorded here as they happen."
      />

      <div className="cp-pagination">
        <span>{formatCount(total)} entries</span>
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

AuditLog.propTypes = {
  entries: PropTypes.arrayOf(PropTypes.object).isRequired,
  total: PropTypes.number.isRequired,
  page: PropTypes.number.isRequired,
  pages: PropTypes.number.isRequired,
  filters: PropTypes.object.isRequired,
  onFiltersChange: PropTypes.func.isRequired,
};
