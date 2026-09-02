'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import Config from '@/lib/config';

const ROLES = ['Member', 'Officer', 'Admin'];

/**
 * Assign-role dialog, opened from "+ Add admin" / "+ Add officer".
 *
 * The committee chips come from Config.committees — the canonical list — and never from a
 * local copy. A second hardcoded list here previously left out the only committee that had
 * officers, making it impossible to assign anyone to it.
 *
 * State is reset by remounting: the caller passes a `key` that changes each time the dialog
 * opens, so a previous attempt cannot leak into the next one and no reset effect is needed.
 */
export default function AssignRoleDialog({
  open, initialRole, prefill, onClose, onAssign,
}) {
  const [email, setEmail] = useState(prefill?.email ?? '');
  const [role, setRole] = useState(prefill?.role ?? initialRole);
  const [committees, setCommittees] = useState(prefill?.committees ?? []);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const toggleCommittee = (committee) => {
    setCommittees((current) => (current.includes(committee)
      ? current.filter((c) => c !== committee)
      : [...current, committee]));
  };

  const submit = async () => {
    if (!email.trim()) {
      setError('An email is required.');
      return;
    }
    if (role === 'Officer' && committees.length === 0) {
      setError('An officer needs at least one committee.');
      return;
    }

    setSaving(true);
    setError('');
    // Prefer the uuid when editing an existing row: it survives an email edit in the field and
    // avoids a lookup round trip.
    const result = await onAssign({
      uuid: prefill?.uuid, email: email.trim(), role, committees,
    });
    setSaving(false);

    if (result && result.success) onClose();
    else setError((result && result.error) || 'Could not assign the role.');
  };

  return (
    <div
      className="cp-dialog-backdrop"
      role="presentation"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="cp-dialog" role="dialog" aria-modal="true" aria-label="Assign role">
        <h3>Assign role</h3>

        <div>
          <label className="cp-field-label" htmlFor="cp-assign-email">Email</label>
          <input
            id="cp-assign-email"
            type="email"
            value={email}
            placeholder="name@g.ucla.edu"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <span className="cp-field-label">Role</span>
          <div className="cp-segmented">
            {ROLES.map((option) => (
              <button
                key={option}
                type="button"
                className={role === option ? 'selected' : ''}
                onClick={() => setRole(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {role !== 'Member' && (
          <div>
            <span className="cp-field-label">Committees</span>
            <div className="cp-chip-group">
              {Config.committees.map((committee) => (
                <button
                  key={committee}
                  type="button"
                  className={`cp-chip ${committees.includes(committee) ? 'selected' : ''}`}
                  onClick={() => toggleCommittee(committee)}
                >
                  {committee}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && <div className="cp-dialog-error">{error}</div>}

        <div className="cp-dialog-footer">
          <button type="button" className="cp-btn secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="cp-btn primary" onClick={submit} disabled={saving}>
            {saving ? 'Assigning…' : 'Assign'}
          </button>
        </div>
      </div>
    </div>
  );
}

AssignRoleDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  initialRole: PropTypes.string,
  prefill: PropTypes.shape({
    uuid: PropTypes.string,
    email: PropTypes.string,
    role: PropTypes.string,
    committees: PropTypes.arrayOf(PropTypes.string),
  }),
  onClose: PropTypes.func.isRequired,
  onAssign: PropTypes.func.isRequired,
};

AssignRoleDialog.defaultProps = { initialRole: 'Officer', prefill: null };
