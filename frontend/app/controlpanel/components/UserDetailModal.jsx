'use client';

import PropTypes from 'prop-types';
import { Pill, TagGroup } from './primitives';
import {
  formatCount, formatDate, formatRelative, formatYear,
} from '../format';

const ROLE_TONE = { Admin: 'admin', Officer: 'officer', Member: 'member' };

function Row({ label, children }) {
  return (
    <div className="cp-detail-row">
      <span className="cp-detail-label">{label}</span>
      <span className="cp-detail-value">{children}</span>
    </div>
  );
}

Row.propTypes = { label: PropTypes.string.isRequired, children: PropTypes.node };
Row.defaultProps = { children: '—' };

/**
 * Read-only detail view for one member.
 *
 * Renders only what the roster endpoint returned, so an officer viewing a member outside their
 * committees sees the redacted fields as "Hidden" rather than blank — the distinction between
 * "no value" and "not permitted" stays visible.
 */
export default function UserDetailModal({ user, onEditRole, canManageRoles, onClose }) {
  if (!user) return null;

  const hidden = <span className="cp-redacted">Hidden</span>;

  return (
    <div
      className="modal-wrapper"
      role="presentation"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="attendees-modal-container">
        <div className="padding">
          <div className="cp-detail-head">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={user.picture || '/unknown.png'} alt="" />
            <div>
              <h1 style={{ margin: 0, textAlign: 'left' }}>
                {user.firstName} {user.lastName}
              </h1>
              <Pill tone={ROLE_TONE[user.role] || 'member'}>{user.role}</Pill>
            </div>
          </div>

          <div className="cp-detail-grid">
            <Row label="Email">{user.email || hidden}</Row>
            <Row label="Committees"><TagGroup items={user.committees} /></Row>
            <Row label="Year">{formatYear(user.year)}</Row>
            <Row label="Major">{user.major || '—'}</Row>
            <Row label="Points">{formatCount(user.points)}</Row>
            <Row label="Account state">{user.state || '—'}</Row>
            <Row label="Joined">{formatDate(user.joinedAt)}</Row>
            <Row label="Last active">
              {user.redacted ? hidden : formatRelative(user.lastActiveAt)}
            </Row>
            {user.role !== 'Member' && (
              <>
                <Row label="Role granted by">
                  {user.redacted ? hidden : (user.roleGrantedBy || '—')}
                </Row>
                <Row label="Role granted on">
                  {user.redacted ? hidden : formatDate(user.roleGrantedAt)}
                </Row>
                <Row label="Position">{user.position || '—'}</Row>
              </>
            )}
          </div>

          <div className="cp-detail-footer">
            {canManageRoles && (
              <button type="button" className="cp-btn primary" onClick={() => onEditRole(user)}>
                Edit role
              </button>
            )}
            <button type="button" className="cp-btn secondary" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}

UserDetailModal.propTypes = {
  user: PropTypes.object,
  canManageRoles: PropTypes.bool.isRequired,
  onEditRole: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

UserDetailModal.defaultProps = { user: null };
