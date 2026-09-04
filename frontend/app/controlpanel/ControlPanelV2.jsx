'use client';

import PropTypes from 'prop-types';
import { formatCount } from './format';

/**
 * The left rail.
 *
 * Governing rule from the design: a rail item is a place you can look at, never a thing you do.
 * Actions live next to the object they act on, so there are no orphan verbs here. The two
 * session controls in the footer are deliberately outside the nav for the same reason.
 */
// `adminOnly` mirrors the permission matrix: officers are denied the role map, the audit log,
// and portal configuration. Those sections are hidden rather than shown empty — an officer
// seeing "Admins & Officers 0" reads as "there are none", not "you cannot see this".
export const SECTIONS = [
  { id: 'overview', label: 'Overview', icon: 'fa-gauge-high' },
  { id: 'users', label: 'Users', icon: 'fa-users' },
  { id: 'roles', label: 'Admins & Officers', icon: 'fa-user-shield', adminOnly: true },
  { id: 'committees', label: 'Committees', icon: 'fa-sitemap' },
  { id: 'events', label: 'Events', icon: 'fa-calendar-days' },
  { id: 'media', label: 'Media', icon: 'fa-image' },
  { id: 'audit', label: 'Audit log', icon: 'fa-clock-rotate-left', adminOnly: true },
  { id: 'settings', label: 'Settings', icon: 'fa-gear', adminOnly: true },
];

/** The sections a given role may actually open. */
export const visibleSections = (isAdmin) => SECTIONS.filter((s) => isAdmin || !s.adminOnly);

export default function ControlPanelV2({
  section, onSectionChange, counts, isAdmin, onLogout, children,
}) {
  return (
    <div className="control-panel-v2">
      <div className="cp-layout">
        <nav className="cp-rail" aria-label="Control panel sections">
          <p className="cp-rail-label">Control panel</p>

          {/* The nav scrolls on its own so the session controls below stay pinned to the
              bottom of the viewport rather than being pushed off by a long section list. */}
          <div className="cp-nav-items">
            {visibleSections(isAdmin).map((item) => {
            // Counts come from the canonical dataset via `counts`; a section with nothing
            // meaningful to count renders no badge rather than a zero.
              const count = counts[item.id];
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`cp-nav-item ${section === item.id ? 'active' : ''}`}
                  onClick={() => onSectionChange(item.id)}
                  aria-current={section === item.id ? 'page' : undefined}
                >
                  <i className={`fa ${item.icon} cp-nav-icon`} aria-hidden="true" />
                  <span className="cp-nav-label">{item.label}</span>
                  {count !== undefined && count !== null && (
                    <span className="cp-nav-count">{formatCount(count)}</span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="cp-rail-footer">
            <button type="button" className="cp-signout" onClick={onLogout}>Sign out</button>
          </div>
        </nav>

        <main className="cp-main">{children}</main>
      </div>
    </div>
  );
}

ControlPanelV2.propTypes = {
  section: PropTypes.string.isRequired,
  onSectionChange: PropTypes.func.isRequired,
  counts: PropTypes.object.isRequired,
  isAdmin: PropTypes.bool.isRequired,
  onLogout: PropTypes.func.isRequired,
  children: PropTypes.node,
};

ControlPanelV2.defaultProps = { children: null };
