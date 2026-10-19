'use client';

import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import Config from '@/lib/config';
import DataTable from '../components/DataTable';
import {
  PageHeader, Pill, ApiLegend, SearchField, Select,
} from '../components/primitives';
import { eventStatus, formatCount, formatDate } from '../format';

const STATUS_TONE = { Upcoming: 'success', Draft: 'warning', Past: 'muted' };

const TIME_OPTIONS = [
  { value: 'all', label: 'All time' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'past', label: 'Past' },
  { value: 'draft', label: 'Drafts' },
];

export default function Events({
  events, lastSync, canSync, onSync, onAdd, onEdit, onViewRSVPs, onDelete,
}) {
  const [search, setSearch] = useState('');
  const [committee, setCommittee] = useState('');
  const [time, setTime] = useState('all');

  const committeeOptions = useMemo(() => [
    { value: '', label: 'All committees' },
    ...Config.committees.map((c) => ({ value: c, label: c })),
  ], []);

  const visible = events.filter((event) => {
    if (search && !event.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (committee && event.committee !== committee) return false;
    if (time === 'all') return true;
    return eventStatus(event).toLowerCase() === time;
  });

  const columns = [
    { key: 'title', label: 'Event', cellClassName: 'identifier', render: (e) => e.title },
    { key: 'committee', label: 'Committee', render: (e) => e.committee || 'ACM' },
    {
      key: 'date',
      label: 'Date',
      render: (e) => (e.startDate ? formatDate(moment(e.startDate)) : '—'),
    },
    { key: 'location', label: 'Location', render: (e) => e.location || '—' },
    {
      key: 'points', label: 'Points', numeric: true, render: (e) => e.attendancePoints ?? 0,
    },
    {
      key: 'rsvps', label: 'RSVPs', numeric: true, render: (e) => formatCount(e.rsvpCount ?? 0),
    },
    {
      key: 'checkedIn',
      label: 'Checked in',
      numeric: true,
      render: (e) => formatCount(e.attendanceCount ?? 0),
    },
    {
      key: 'status',
      label: 'Status',
      render: (e) => {
        const status = eventStatus(e);
        return <Pill tone={STATUS_TONE[status]}>{status}</Pill>;
      },
    },
    {
      key: 'actions',
      label: '',
      cellClassName: 'cp-row-actions',
      render: (e) => (
        <>
          <button type="button" className="secondary" onClick={() => onViewRSVPs(e)}>RSVPs</button>
          <button type="button" className="primary" onClick={() => onEdit(e)}>Edit</button>
          <button type="button" className="destructive" onClick={() => onDelete(e)}>Delete</button>
        </>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Events"
        subtitle="Every event, its attendance, and where it came from."
      />

      <div className="cp-toolbar">
        <SearchField value={search} onChange={setSearch} placeholder="Search events" />
        <Select
          label="Filter by committee"
          value={committee}
          onChange={setCommittee}
          options={committeeOptions}
        />
        <Select label="Filter by time" value={time} onChange={setTime} options={TIME_OPTIONS} />
        <div className="cp-toolbar-right">
          {/* Sheets sync writes events across every committee, so it is admin-only on the API.
              Hidden rather than disabled: a greyed-out control an officer can never use is
              just noise. */}
          {canSync && (
            <>
              <span className="cp-toolbar-meta">{lastSync}</span>
              <button type="button" className="cp-btn secondary" onClick={onSync}>
                Sync from Sheets
              </button>
            </>
          )}
          <button type="button" className="cp-btn primary" onClick={onAdd}>+ Add event</button>
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={visible}
        rowKey={(e) => e.uuid}
        empty="No events match these filters."
      />

      <ApiLegend />
    </>
  );
}

Events.propTypes = {
  events: PropTypes.arrayOf(PropTypes.object).isRequired,
  lastSync: PropTypes.string.isRequired,
  canSync: PropTypes.bool.isRequired,
  onSync: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onViewRSVPs: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};
