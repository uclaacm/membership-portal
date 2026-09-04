'use client';

import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import './checkInModal.scss';

/**
 * Member check-in.
 *
 * Backdrop click, ✕ and Escape all close it, and the panel stops click propagation — without
 * that, dragging a scrollbar or clicking inside the panel dismisses it.
 */
export default function CheckInModal({ onClose, onSubmit }) {
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const submit = async () => {
    if (!code.trim() || busy) return;
    setBusy(true);
    const res = await onSubmit(code.trim());
    setBusy(false);
    setResult(res?.success
      ? { ok: true, message: `Checked in — ${res.points ?? 0} points added.` }
      : { ok: false, message: res?.error || 'That code did not match an event.' });
    if (res?.success) setCode('');
  };

  return (
    <div className="checkin-backdrop" onClick={onClose} role="presentation">
      <div
        className="checkin-panel"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Event check-in"
      >
        <button type="button" className="checkin-close" onClick={onClose} aria-label="Close">✕</button>
        <h2 className="checkin-title">Event check-in</h2>
        <p className="checkin-sub">Enter the code shown at the event to claim your points.</p>

        <input
          className="checkin-input"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
          placeholder="Attendance code"
          aria-label="Attendance code"
        />

        {result && (
          <p className={`checkin-result${result.ok ? ' is-ok' : ' is-error'}`}>{result.message}</p>
        )}

        <button type="button" className="checkin-submit" onClick={submit} disabled={busy || !code.trim()}>
          {busy ? 'Checking in…' : 'Check in'}
        </button>
      </div>
    </div>
  );
}

CheckInModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};
