'use client';

import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import fetchEventRSVPs from '@/app/actions/rsvp/fetchEventRSVPs';
import fetchEventCheckIns from '@/app/actions/attendance/fetchEventCheckIns';
import { formatCount } from '../format';
// `.modal-wrapper` and `.attendees-modal-container` live here. Imported by the component rather
// than its pages: /controlpanel pulled this sheet in for its own modals and so happened to style
// this one too, while /events did not — leaving the overlay unstyled and rendering as a block at
// the foot of the page.
import '@/components/Modal/style.scss';

// What each `kind` of list shows, and where it loads from.
const KINDS = {
  rsvps: {
    title: 'RSVPs',
    noun: 'RSVP',
    empty: 'Nobody has RSVPed to this event yet.',
    load: async (uuid) => {
      const result = await fetchEventRSVPs(uuid);
      return { ...result, records: result.rsvps };
    },
    lastColumn: 'Status',
    lastCell: (record) => (record.attended ? 'Checked in' : 'RSVPed'),
  },
  checkins: {
    title: 'Check-ins',
    noun: 'check-in',
    empty: 'Nobody has checked in to this event yet.',
    load: async (uuid) => {
      const result = await fetchEventCheckIns(uuid);
      return { ...result, records: result.attendance };
    },
    lastColumn: 'Checked in at',
    lastCell: (record) => (record.date ? moment(record.date).format('MMM D, h:mm a') : '—'),
  },
};

/**
 * Attendee list for one event: who RSVPed (GET /rsvp/event/:uuid) or, with kind="checkins",
 * who checked in with the attendance code (GET /attendance/:uuid).
 *
 * Fetches on open rather than with the events list: these are only ever looked at one event at
 * a time, and the list endpoint already returns the counts the table needs.
 */
export default function EventRSVPsModal({ event, onClose, kind }) {
  const config = KINDS[kind];
  const [state, setState] = useState({ loading: true, rsvps: [], error: '' });

  useEffect(() => {
    if (!event) return undefined;

    // Guards against a slow response for a previously-opened event overwriting the current one.
    let active = true;
    const load = async () => {
      setState({ loading: true, rsvps: [], error: '' });
      const result = await config.load(event.uuid);
      if (!active) return;
      setState({
        loading: false,
        rsvps: result.records ?? [],
        error: result.success ? '' : (result.error || `Could not load ${config.title}.`),
      });
    };
    load();

    return () => { active = false; };
  }, [event, config]);

  if (!event) return null;

  const { loading, rsvps, error } = state;

  return (
    <div
      className="modal-wrapper"
      role="presentation"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="attendees-modal-container">
        <div className="padding">
          <h1>{config.title}</h1>
          <p style={{ marginTop: 0 }}>
            <strong>{event.title}</strong>
            {' — '}
            {loading
              ? 'loading…'
              : `${formatCount(rsvps.length)} ${config.noun}${rsvps.length === 1 ? '' : 's'}`}
            {!loading && kind === 'rsvps' && event.capacity ? ` · capacity ${formatCount(event.capacity)}` : ''}
          </p>

          {error && <p style={{ color: '#c14b4b' }}>{error}</p>}

          {!loading && !error && rsvps.length === 0 && (
            <p>{config.empty}</p>
          )}

          {!loading && rsvps.length > 0 && (
            <div className="cp-table-scroll" style={{ maxHeight: 340, overflowY: 'auto' }}>
              <table className="cp-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>{config.lastColumn}</th>
                  </tr>
                </thead>
                <tbody>
                  {rsvps.map((rsvp) => {
                    const user = rsvp.user || rsvp;
                    return (
                      <tr key={rsvp.uuid || user.uuid || user.email}>
                        <td className="identifier">
                          {user.firstName || user.lastName
                            ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()
                            : '—'}
                        </td>
                        <td>{user.email || '—'}</td>
                        <td>{config.lastCell(rsvp)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="button-container" style={{ marginTop: 18 }}>
            <button type="button" className="cp-btn secondary" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}

EventRSVPsModal.propTypes = {
  event: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  kind: PropTypes.oneOf(['rsvps', 'checkins']),
};

EventRSVPsModal.defaultProps = { event: null, kind: 'rsvps' };
