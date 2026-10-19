'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';

/**
 * Event check-in.
 *
 * The old version put 1.5rem of padding inside a 2.5rem-high input, which clipped the
 * placeholder to "Enter Ch". This is a 44px row — also the touch-target floor, so it needs no
 * separate mobile size.
 *
 * Feedback is inline under the input rather than a toast: a toast covers the hero, which is
 * exactly where the eye is after submitting.
 */
export default function CheckInCard({ onCheckIn }) {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (!code.trim() || submitting) return;

    setSubmitting(true);
    setStatus(null);

    const result = await onCheckIn(code.trim());
    setSubmitting(false);

    if (result.success) {
      setCode('');
      setStatus({ ok: true, message: `Checked in — ${result.points ?? 0} points awarded.` });
      setTimeout(() => setStatus(null), 5000);
    } else {
      setStatus({ ok: false, message: result.error || 'That code was not accepted.' });
    }
  };

  return (
    <section className="dash-card dash-checkin" style={{ order: 2 }}>
      <span className="dash-label">Event check-in</span>

      <form className="dash-checkin-row" onSubmit={submit}>
        <input
          type="text"
          value={code}
          placeholder="Enter check-in code"
          aria-label="Enter check-in code"
          onChange={(e) => { setCode(e.target.value); setStatus(null); }}
        />
        <button type="submit" aria-label="Check in" disabled={submitting}>
          <i className="fa fa-arrow-right" aria-hidden="true" />
        </button>
      </form>

      {status && (
        <p className={`dash-checkin-status ${status.ok ? 'ok' : 'error'}`}>{status.message}</p>
      )}
    </section>
  );
}

CheckInCard.propTypes = { onCheckIn: PropTypes.func.isRequired };
