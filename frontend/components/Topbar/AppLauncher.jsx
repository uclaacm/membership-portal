'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import PropTypes from 'prop-types';
import Config from '@/lib/config';

// Icon and tint key off the existing `type` field on Config.resources, so adding a link is a
// config edit rather than a change here. Unknown types fall back to a neutral chip.
const RESOURCE_STYLES = {
  website: { icon: 'fa-solid fa-globe', color: '#1d6bff', background: '#e8f0fe' },
  discord: { icon: 'fa-brands fa-discord', color: '#5865f2', background: '#eceefe' },
  github: { icon: 'fa-brands fa-github', color: '#24292f', background: '#f0f0f0' },
  facebook: { icon: 'fa-brands fa-facebook', color: '#1877f2', background: '#e7f0fe' },
  medium: { icon: 'fa-brands fa-medium', color: '#000000', background: '#f0f0f0' },
};
const RESOURCE_FALLBACK = { icon: 'fa-solid fa-link', color: '#979797', background: '#f0f0f0' };

/**
 * The Drive-style app launcher.
 *
 * The bar no longer changes shape by role — Home / Events / Resources are constant and
 * everything conditional (Internship, Career Hub, Control Panel, the external links) lives
 * here. What varies by role is the launcher's contents, not the nav.
 */
export default function AppLauncher({
  open, onToggle, onClose, staff, cycle,
}) {
  // The ref wraps the panel *and* its trigger. Scoping the outside-click guard to the topbar
  // root would make the whole bar count as "inside", so clicking the wordmark or a nav link
  // would never dismiss the panel.
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) onClose();
    };
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  // `cycle` is null until the lookup resolves. Neither state may be asserted before then —
  // showing "Applications closed" while the internship screens showed everything open was the
  // bug this guard exists to prevent.
  const cycleOpen = !!cycle?.open;
  let internshipMeta = 'Applications and committees';
  if (cycle) {
    if (cycleOpen) {
      const count = `${cycle.openCount} committee${cycle.openCount === 1 ? '' : 's'}`;
      internshipMeta = staff
        ? `Cycle open · ${cycle.awaitingReview != null ? `${cycle.awaitingReview} awaiting review` : count}`
        : `Applications open · ${count}${cycle.closes ? ` · closes ${cycle.closes}` : ''}`;
    } else {
      internshipMeta = 'Applications closed';
    }
  }

  return (
    <div className="launcher" ref={wrapperRef}>
      <button
        type="button"
        className={`launcher-btn${open ? ' is-open' : ''}`}
        onClick={onToggle}
        aria-label="Open app launcher"
        aria-expanded={open}
      >
        <i className="fa-solid fa-grip" aria-hidden="true" />
        {/* Signals that something needs attention without the bar changing shape. Hidden while
            the panel is open, since the panel itself is now the answer. */}
        {cycleOpen && !open && <span className="launcher-dot" />}
      </button>

      {open && (
        <div className="launcher-panel" role="menu">
          <p className="launcher-section">Programs</p>

          <Link href="/internship" className="launcher-row" onClick={onClose} role="menuitem">
            <i className="fa-solid fa-file-lines launcher-row-icon" style={{ color: 'rgb(59,89,237)' }} aria-hidden="true" />
            <span className="launcher-row-text">
              <span className="launcher-row-label">Internship</span>
              <span className={`launcher-row-meta${cycleOpen ? ' is-open' : ''}`}>{internshipMeta}</span>
            </span>
            <i className="fa-solid fa-chevron-right launcher-row-chevron" aria-hidden="true" />
          </Link>

          {staff && (
            <>
              <div className="launcher-divider" />
              <p className="launcher-section">Admin</p>
              <Link href="/controlpanel" className="launcher-row" onClick={onClose} role="menuitem">
                <i className="fa-solid fa-user-shield launcher-row-icon" style={{ color: 'rgb(47,70,188)' }} aria-hidden="true" />
                <span className="launcher-row-text">
                  <span className="launcher-row-label">Control Panel</span>
                  <span className="launcher-row-meta">Users, committees, audit log</span>
                </span>
                <i className="fa-solid fa-chevron-right launcher-row-chevron" aria-hidden="true" />
              </Link>
            </>
          )}

          <div className="launcher-divider" />
          <p className="launcher-section">{Config.organization.shortName}</p>
          <div className="launcher-tiles">
            {Config.organization.resources.map((resource) => {
              const style = RESOURCE_STYLES[resource.type] || RESOURCE_FALLBACK;
              return (
                <a
                  key={resource.title}
                  className="launcher-tile"
                  href={resource.link}
                  target="_blank"
                  rel="noreferrer"
                >
                  <span className="launcher-tile-icon" style={{ background: style.background }}>
                    <i className={style.icon} style={{ color: style.color }} aria-hidden="true" />
                  </span>
                  <span className="launcher-tile-label">{resource.title}</span>
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

AppLauncher.propTypes = {
  open: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  staff: PropTypes.bool,
  /** `{ open, closes, awaitingReview }` — one shape read by the dot, the meta line and the banner. */
  cycle: PropTypes.object,
};

AppLauncher.defaultProps = { staff: false, cycle: null };
