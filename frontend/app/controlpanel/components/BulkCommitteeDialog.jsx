'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import Config from '@/lib/config';

const MODES = [
  { value: 'add', label: 'Add to' },
  { value: 'remove', label: 'Remove from' },
  { value: 'replace', label: 'Replace with' },
];

/**
 * Assigns committees to the users currently selected in the Users table.
 *
 * Chips come from Config.committees — the canonical list — never a local copy.
 */
export default function BulkCommitteeDialog({ open, count, onClose, onApply }) {
  const [committees, setCommittees] = useState([]);
  const [mode, setMode] = useState('add');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const toggle = (committee) => setCommittees((current) => (current.includes(committee)
    ? current.filter((c) => c !== committee)
    : [...current, committee]));

  const submit = async () => {
    // 'replace' with nothing selected is a legitimate way to clear every committee; the other
    // two modes need at least one to act on.
    if (committees.length === 0 && mode !== 'replace') {
      setError('Pick at least one committee.');
      return;
    }

    setSaving(true);
    setError('');
    const result = await onApply({ committees, committeeMode: mode });
    setSaving(false);

    if (result?.success) onClose();
    else setError(result?.error || 'Could not update committees.');
  };

  return (
    <div
      className="cp-dialog-backdrop"
      role="presentation"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="cp-dialog" role="dialog" aria-modal="true" aria-label="Assign committee">
        <h3>Assign committee</h3>
        <p style={{ margin: 0, fontSize: 13, color: 'rgba(0,0,0,0.6)' }}>
          Applies to {count} selected user{count === 1 ? '' : 's'}.
        </p>

        <div>
          <span className="cp-field-label">Action</span>
          <div className="cp-segmented">
            {MODES.map((option) => (
              <button
                key={option.value}
                type="button"
                className={mode === option.value ? 'selected' : ''}
                onClick={() => setMode(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="cp-field-label">Committees</span>
          <div className="cp-chip-group">
            {Config.committees.map((committee) => (
              <button
                key={committee}
                type="button"
                className={`cp-chip ${committees.includes(committee) ? 'selected' : ''}`}
                onClick={() => toggle(committee)}
              >
                {committee}
              </button>
            ))}
          </div>
          {mode === 'replace' && committees.length === 0 && (
            <p style={{ fontSize: 12, color: '#979797', marginBottom: 0 }}>
              Nothing selected — this will clear every committee on those users.
            </p>
          )}
        </div>

        {error && <div className="cp-dialog-error">{error}</div>}

        <div className="cp-dialog-footer">
          <button type="button" className="cp-btn secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="cp-btn primary" onClick={submit} disabled={saving}>
            {saving ? 'Applying…' : 'Apply'}
          </button>
        </div>
      </div>
    </div>
  );
}

BulkCommitteeDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  count: PropTypes.number.isRequired,
  onClose: PropTypes.func.isRequired,
  onApply: PropTypes.func.isRequired,
};
