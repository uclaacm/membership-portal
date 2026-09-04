'use client';

import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  fetchEmailSettings, updateEmailSettings, sendTestEmail,
} from '@/app/actions/settings/emailSettings';
import {
  PageHeader, SectionHead, Pill, ApiLegend, PendingButton,
} from '../components/primitives';
import { formatRelative } from '../format';


/**
 * Email notification transport.
 *
 * The credential is write-only: the API returns whether one is stored, never the value, so the
 * field is always blank on load and an empty submit means "keep what is there".
 */
function EmailSettingsBlock({ canManage, notify }) {
  const [settings, setSettings] = useState({ transport: 'none', configured: false });
  const [token, setToken] = useState('');
  const [saving, setSaving] = useState(false);
  const [testResult, setTestResult] = useState('');

  useEffect(() => {
    let active = true;
    const load = async () => {
      const loaded = await fetchEmailSettings();
      if (active) setSettings(loaded);
    };
    load();
    return () => { active = false; };
  }, []);

  const field = (key) => (e) => setSettings((c) => ({ ...c, [key]: e.target.value }));

  const save = async () => {
    setSaving(true);
    const payload = { ...settings };
    // Only send a token when one was typed, so saving a from-address does not wipe the
    // stored credential.
    if (token.trim()) payload.token = token.trim();
    const result = await updateEmailSettings(payload);
    setSaving(false);

    if (result.success) {
      setSettings(result.settings ?? settings);
      setToken('');
      notify(true, 'Email settings saved.');
    } else {
      notify(false, result.error || 'Could not save email settings.');
    }
  };

  const test = async () => {
    const result = await sendTestEmail();
    setTestResult(result.message);
    notify(result.sent, result.message);
  };

  return (
    <div className="cp-setting-block">
      <SectionHead title="Email notifications" />
      <p className="cp-setting-state">
        Marketing is emailed when an event with platforms selected is created or updated.{' '}
        {settings.configured
          ? `Transport: ${settings.transport}.`
          : 'No transport configured — events still save, and the notice is reported instead.'}
        {settings.lastSentAt ? ` Last sent ${formatRelative(settings.lastSentAt)}.` : ''}
      </p>

      <div className="cp-field narrow">
        <label className="cp-field-label" htmlFor="cp-email-transport">Transport</label>
        <select
          id="cp-email-transport"
          value={settings.transport}
          onChange={field('transport')}
          disabled={!canManage}
        >
          <option value="none">None — do not send</option>
          <option value="google">Google Workspace service account</option>
          <option value="smtp">SMTP</option>
          <option value="api">Transactional API</option>
        </select>
      </div>

      {settings.transport !== 'none' && (
        <div className="cp-field wide">
          <label className="cp-field-label" htmlFor="cp-email-from">Send from</label>
          <input
            id="cp-email-from"
            type="text"
            value={settings.from ?? ''}
            onChange={field('from')}
            placeholder="portal@uclaacm.com"
            disabled={!canManage}
          />
        </div>
      )}

      {/* The service-account route needs no secret stored here — only the delegation grant. */}
      {settings.transport === 'google' && (
        <p className="cp-service-account">
          Grant <code>portal-sync@acm-portal.iam.gserviceaccount.com</code> domain-wide
          delegation for the <code>gmail.send</code> scope. No secret is stored in the portal.
        </p>
      )}

      {settings.transport === 'smtp' && (
        <>
          <div className="cp-field narrow">
            <label className="cp-field-label" htmlFor="cp-email-host">Host and port</label>
            <input
              id="cp-email-host"
              type="text"
              value={settings.host ?? ''}
              onChange={field('host')}
              placeholder="smtp.gmail.com"
              disabled={!canManage}
            />
          </div>
          <div className="cp-field narrow">
            <label className="cp-field-label" htmlFor="cp-email-user">Username</label>
            <input
              id="cp-email-user"
              type="text"
              value={settings.username ?? ''}
              onChange={field('username')}
              disabled={!canManage}
            />
          </div>
        </>
      )}

      {(settings.transport === 'smtp' || settings.transport === 'api') && (
        <div className="cp-field narrow">
          <label className="cp-field-label" htmlFor="cp-email-token">
            {settings.transport === 'smtp' ? 'App password' : 'API token'}
          </label>
          <input
            id="cp-email-token"
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder={settings.configured ? 'Stored — leave blank to keep' : ''}
            disabled={!canManage}
          />
        </div>
      )}

      {testResult && <p className="cp-setting-state">{testResult}</p>}

      <div style={{ display: 'flex', gap: 10 }}>
        <button type="button" className="cp-btn primary" onClick={save} disabled={!canManage || saving}>
          {saving ? 'Saving…' : 'Save'}
        </button>
        <button type="button" className="cp-btn secondary" onClick={test} disabled={!canManage}>
          Send test email
        </button>
      </div>
    </div>
  );
}

EmailSettingsBlock.propTypes = {
  canManage: PropTypes.bool.isRequired,
  notify: PropTypes.func.isRequired,
};

export default function Settings({
  serviceAccountEmail, system, canManage, notify, onRotatePassword, onSync, onCloseCycle,
}) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [sheetUrl, setSheetUrl] = useState('');
  const [rotating, setRotating] = useState(false);

  const rotate = async () => {
    setRotating(true);
    await onRotatePassword(oldPassword, newPassword);
    setRotating(false);
    setOldPassword('');
    setNewPassword('');
  };

  return (
    <>
      <PageHeader
        title="Settings"
        subtitle="Portal-wide configuration and integrations."
      />

      <div className="cp-settings">
        <div className="cp-setting-block">
          <SectionHead title="One-click attendance API" />
          <p className="cp-setting-state">{system.oneClickRotated}</p>

          <div className="cp-field narrow">
            <label className="cp-field-label" htmlFor="cp-old-password">Current password</label>
            <input
              id="cp-old-password"
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
          </div>
          <div className="cp-field narrow">
            <label className="cp-field-label" htmlFor="cp-new-password">New password</label>
            <input
              id="cp-new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <button
            type="button"
            className="cp-btn primary"
            onClick={rotate}
            disabled={!canManage || rotating || !oldPassword || !newPassword}
          >
            {rotating ? 'Rotating…' : 'Rotate password'}
          </button>
        </div>

        <div className="cp-setting-block">
          <SectionHead title="Google Sheets sync" />
          <p className="cp-setting-state">{system.lastSync}</p>

          <div className="cp-field wide">
            <label className="cp-field-label" htmlFor="cp-sheet-url">Spreadsheet URL</label>
            <input
              id="cp-sheet-url"
              type="url"
              value={sheetUrl}
              placeholder="https://docs.google.com/spreadsheets/…"
              onChange={(e) => setSheetUrl(e.target.value)}
            />
          </div>

          {serviceAccountEmail && (
            <p className="cp-service-account">
              Share the sheet with <code>{serviceAccountEmail}</code>
            </p>
          )}

          <button
            type="button"
            className="cp-btn secondary"
            onClick={() => onSync(sheetUrl)}
            disabled={!canManage}
          >
            Sync now
          </button>
        </div>

        <EmailSettingsBlock canManage={canManage} notify={notify} />

        <div className="cp-setting-block">
          <SectionHead title="Recruitment cycle" />
          <p className="cp-setting-state">
            There is no cycle object in the API. This row is derived from which committees
            currently have recruitment open, and &ldquo;Close cycle&rdquo; closes all of them at
            once. A real cycle — with a name, open and close dates, and history — needs its own
            model and endpoints.
          </p>
          <div className="cp-cycle-row">
            <span>{system.cycleName}</span>
            {system.cycleOpen
              ? <Pill tone="success">Open</Pill>
              : <Pill tone="muted">Closed</Pill>}
            <span className="cp-cycle-meta">{system.recruitment}</span>
            <button
              type="button"
              className="cp-btn danger small"
              onClick={onCloseCycle}
              disabled={!canManage || !system.cycleOpen}
            >
              Close cycle
            </button>
          </div>
          <div style={{ marginTop: 12 }}>
            <PendingButton
              small
              label="Open next cycle"
              note="Needs a recruitment cycle model — opening a cycle should set per-committee deadlines, which no endpoint currently does."
            />
          </div>
        </div>
      </div>

      <ApiLegend pending />
    </>
  );
}

Settings.propTypes = {
  serviceAccountEmail: PropTypes.string,
  system: PropTypes.object.isRequired,
  canManage: PropTypes.bool.isRequired,
  notify: PropTypes.func.isRequired,
  onRotatePassword: PropTypes.func.isRequired,
  onSync: PropTypes.func.isRequired,
  onCloseCycle: PropTypes.func.isRequired,
};

Settings.defaultProps = { serviceAccountEmail: '' };
