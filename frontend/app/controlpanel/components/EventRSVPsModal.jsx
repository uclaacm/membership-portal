'use client';

import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import fetchEventRSVPs from '@/app/actions/rsvp/fetchEventRSVPs';
import { formatCount } from '../format';
// `.modal-wrapper` and `.attendees-modal-container` live here. Imported by the component rather
// than its pages: /controlpanel pulled this sheet in for its own modals and so happened to style
// this one too, while /events did not — leaving the overlay unstyled and rendering as a block at
// the foot of the page.
import '@/components/Modal/style.scss';

/**
 * Attendee list for one event, backed by GET /rsvp/event/:uuid.
 *
 * Fetches on open rather than with the events list: RSVPs are only ever looked at one event at
 * a time, and the list endpoint already returns the counts the table needs.
 */
export default function EventRSVPsModal({ event, onClose }) {
  const [state, setState] = useState({ loading: true, rsvps: [], error: '' });

  useEffect(() => {
    if (!event) return undefined;

    // Guards against a slow response for a previously-opened event overwriting the current one.
    let active = true;
    const load = async () => {
      setState({ loading: true, rsvps: [], error: '' });
      const result = await fetchEventRSVPs(event.uuid);
      if (!active) return;
      setState({
        loading: false,
        rsvps: result.rsvps ?? [],
        error: result.success ? '' : (result.error || 'Could not load RSVPs.'),
      });
    };
    load();

    return () => { active = false; };
  }, [event]);

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
          <h1>RSVPs</h1>
          <p style={{ marginTop: 0 }}>
            <strong>{event.title}</strong>
            {' — '}
            {loading
              ? 'loading…'
              : `${formatCount(rsvps.length)} RSVP${rsvps.length === 1 ? '' : 's'}`}
            {!loading && event.capacity ? ` · capacity ${formatCount(event.capacity)}` : ''}
          </p>

          {error && <p style={{ color: '#c14b4b' }}>{error}</p>}

          {!loading && !error && rsvps.length === 0 && (
            <p>Nobody has RSVPed to this event yet.</p>
          )}

          {!loading && rsvps.length > 0 && (
            <div className="cp-table-scroll" style={{ maxHeight: 340, overflowY: 'auto' }}>
              <table className="cp-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Status</th>
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
                        <td>{rsvp.attended ? 'Checked in' : 'RSVPed'}</td>
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
};

EventRSVPsModal.defaultProps = { event: null };
