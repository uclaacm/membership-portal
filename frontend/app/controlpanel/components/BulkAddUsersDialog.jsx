'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import Config from '@/lib/config';

const ROLES = ['Member', 'Officer', 'Admin'];

/**
 * Splits a pasted block into email addresses.
 *
 * Accepts commas, whitespace, newlines, and semicolons in any combination, because a list
 * pasted out of a spreadsheet, a Slack message, or a mail client all look different. Duplicates
 * are collapsed so the same address is not reported twice.
 */
export const parseEmails = (raw) => [
  ...new Set(
    String(raw)
      .split(/[\s,;]+/)
      .map((entry) => entry.trim())
      .filter(Boolean),
  ),
];

/**
 * Bulk-assigns a role and committees to a pasted list of email addresses.
 *
 * Partial success is expected — an address that never registered cannot be assigned anything —
 * so the result panel lists every failure with its reason rather than reporting one summary.
 */
export default function BulkAddUsersDialog({ open, onClose, onApply }) {
  const [raw, setRaw] = useState('');
  const [role, setRole] = useState('Officer');
  const [committees, setCommittees] = useState([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null);

  if (!open) return null;

  const emails = parseEmails(raw);

  const toggle = (committee) => setCommittees((current) => (current.includes(committee)
    ? current.filter((c) => c !== committee)
    : [...current, committee]));

  const submit = async () => {
    if (emails.length === 0) {
      setError('Paste at least one email address.');
      return;
    }
    if (role === 'Officer' && committees.length === 0) {
      setError('An officer needs at least one committee.');
      return;
    }

    setSaving(true);
    setError('');
    setResult(null);

    const response = await onApply({ emails, role, committees });
    setSaving(false);

    if (!response?.success) {
      setError(response?.error || 'Could not apply the changes.');
      return;
    }
    setResult(response);
  };

  return (
    <div
      className="cp-dialog-backdrop"
      role="presentation"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="cp-dialog wide" role="dialog" aria-modal="true" aria-label="Add users in bulk">
        <h3>Add users in bulk</h3>

        {!result && (
          <>
            <div>
              <label className="cp-field-label" htmlFor="cp-bulk-emails">
                Emails — separated by commas, spaces or new lines
              </label>
              <textarea
                id="cp-bulk-emails"
                rows={6}
                value={raw}
                placeholder={'alice@g.ucla.edu, bob@g.ucla.edu\ncarol@g.ucla.edu'}
                onChange={(e) => setRaw(e.target.value)}
              />
              <p className="cp-field-hint">
                {emails.length} address{emails.length === 1 ? '' : 'es'} detected.
              </p>
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
                      onClick={() => toggle(committee)}
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
                {saving ? 'Applying…' : `Apply to ${emails.length}`}
              </button>
            </div>
          </>
        )}

        {result && (
          <>
            <div className="cp-bulk-result">
              <p className="cp-bulk-ok">
                <strong>{result.updated.length}</strong> updated
                {result.failed.length > 0 && <> · <strong>{result.failed.length}</strong> failed</>}
              </p>

              {result.failed.length > 0 && (
                <div className="cp-table-scroll" style={{ maxHeight: 220, overflowY: 'auto' }}>
                  <table className="cp-table">
                    <thead>
                      <tr><th>Email</th><th>Why it failed</th></tr>
                    </thead>
                    <tbody>
                      {result.failed.map((failure) => (
                        <tr key={failure.identifier}>
                          <td className="identifier">{failure.identifier}</td>
                          <td>{failure.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {result.failed.length === 0 && <p>Every address was updated.</p>}
            </div>

            <div className="cp-dialog-footer">
              <button
                type="button"
                className="cp-btn secondary"
                onClick={() => { setResult(null); setRaw(''); }}
              >
                Add more
              </button>
              <button type="button" className="cp-btn primary" onClick={onClose}>Done</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

BulkAddUsersDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onApply: PropTypes.func.isRequired,
};
