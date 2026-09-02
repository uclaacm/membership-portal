'use client';

import PropTypes from 'prop-types';
import {
  PageHeader, SectionHead, StatTile, ApiLegend,
} from '../components/primitives';
import { formatBytes, formatCount, formatRelative } from '../format';

// Icon and colour per audit action, for the activity feed.
const ACTION_STYLE = {
  'role.grant': { icon: 'fa-user-shield', color: 'rgb(47,70,188)' },
  'role.revoke': { icon: 'fa-user-minus', color: '#c14b4b' },
  'event.create': { icon: 'fa-calendar-plus', color: '#248a45' },
  'event.update': { icon: 'fa-calendar-days', color: 'rgba(0,0,0,0.6)' },
  'event.delete': { icon: 'fa-trash', color: '#c14b4b' },
  'events.sync': { icon: 'fa-rotate', color: 'rgba(0,0,0,0.6)' },
  'media.upload': { icon: 'fa-image', color: 'rgba(0,0,0,0.6)' },
  'media.delete': { icon: 'fa-trash', color: '#c14b4b' },
  'settings.update': { icon: 'fa-key', color: 'rgba(0,0,0,0.6)' },
  'committee.open': { icon: 'fa-folder-open', color: '#248a45' },
  'committee.close': { icon: 'fa-folder-open', color: 'rgba(0,0,0,0.6)' },
  'committee.create': { icon: 'fa-sitemap', color: '#248a45' },
  'committee.update': { icon: 'fa-sitemap', color: 'rgba(0,0,0,0.6)' },
};

const DEFAULT_STYLE = { icon: 'fa-clock-rotate-left', color: 'rgba(0,0,0,0.6)' };

function AttentionRow({
  color, label, count, system,
}) {
  return (
    <div className={`cp-attention-row ${system ? 'system' : ''}`}>
      {!system && <span className="cp-dot" style={{ background: color }} />}
      <span className="cp-attention-label">{label}</span>
      <span className="cp-attention-count">{count}</span>
    </div>
  );
}

AttentionRow.propTypes = {
  color: PropTypes.string,
  label: PropTypes.node.isRequired,
  count: PropTypes.node.isRequired,
  system: PropTypes.bool,
};

AttentionRow.defaultProps = { color: '#ffba43', system: false };

export default function Overview({ data, isAdmin, onNavigate }) {
  const {
    memberTotal, admins, officers, events, images, applications, audit, system,
  } = data;

  const superAdmins = admins.filter((a) => a.accessType === 'SUPERADMIN').length;
  const presidents = admins.length - superAdmins;
  const officerCommittees = new Set(officers.flatMap((o) => o.committees || []));
  const upcoming = events.filter((e) => e.startDate && new Date(e.startDate) > new Date()).length;
  const storedBytes = images.reduce((sum, image) => sum + (image.size || 0), 0);

  const awaitingReview = applications.filter((a) => a.submissionStatus === 'submitted'
    && (!a.status || a.status === 'pending')).length;
  const zeroRsvpEvents = events.filter((e) => e.startDate
    && new Date(e.startDate) > new Date()
    && !(e.rsvpCount > 0)).length;

  return (
    <>
      <PageHeader
        title="Overview"
        subtitle={isAdmin
          ? 'Chapter and portal state at a glance.'
          : 'Your committee\'s state at a glance. Portal-wide figures are admin-only.'}
      />

      <div className="cp-stat-grid">
        <StatTile
          label={isAdmin ? 'Members' : 'Members in your committees'}
          value={formatCount(memberTotal)}
          delta={`${formatCount(events.length)} events run`}
        />
        {/* The role map is admin-only, so these two would read as "0 admins" for an
            officer — which is false rather than merely unavailable. */}
        {isAdmin && (
          <StatTile
            label="Admins"
            value={formatCount(admins.length)}
            delta={`${superAdmins} super admin · ${presidents} president${presidents === 1 ? '' : 's'}`}
          />
        )}
        {isAdmin && (
          <StatTile
            label="Officers"
            value={formatCount(officers.length)}
            delta={`across ${officerCommittees.size} committee${officerCommittees.size === 1 ? '' : 's'}`}
          />
        )}
        <StatTile
          label="Events"
          value={formatCount(events.length)}
          delta={`${upcoming} upcoming`}
        />
        <StatTile
          label="Applications"
          value={formatCount(applications.length)}
          delta={`${awaitingReview} awaiting review`}
          deltaColor="rgba(0,0,0,0.6)"
        />
        <StatTile
          label="Media"
          value={formatCount(images.length)}
          delta={`${formatBytes(storedBytes)} stored`}
        />
      </div>

      <div className="cp-overview-lower">
        <div>
          <SectionHead title="Recent activity" baseline>
            {isAdmin && (
              <button type="button" className="cp-text-button" onClick={() => onNavigate('audit')}>
                View audit log
              </button>
            )}
          </SectionHead>

          {!isAdmin && (
            <div className="cp-empty">
              The activity feed reads from the audit log, which is available to admins only.
            </div>
          )}

          {isAdmin && audit.length === 0 && (
            <div className="cp-empty">
              No privileged actions recorded yet. Entries appear here as roles change and content
              is created or removed.
            </div>
          )}

          {isAdmin && audit.map((entry) => {
            const style = ACTION_STYLE[entry.action] || DEFAULT_STYLE;
            return (
              <div className="cp-activity-row" key={entry.uuid}>
                <i
                  className={`fa ${style.icon} cp-activity-icon`}
                  style={{ color: style.color }}
                  aria-hidden="true"
                />
                <span className="cp-activity-text">
                  <b>{entry.actorName || 'Unknown'}</b>
                  {' '}
                  {entry.detail || entry.action}
                  {entry.target && <> — <b>{entry.target}</b></>}
                </span>
                <span className="cp-activity-time">{formatRelative(entry.createdAt)}</span>
              </div>
            );
          })}
        </div>

        <div>
          <SectionHead title="Needs attention" baseline />
          <AttentionRow label="Applications awaiting review" count={awaitingReview} />
          <AttentionRow
            label={<>Interviews unscheduled <span className="cp-dagger">†</span></>}
            count="—"
          />
          <AttentionRow
            color="#c14b4b"
            label="Upcoming events with zero RSVPs"
            count={zeroRsvpEvents}
          />

          <div style={{ marginTop: 28 }}>
            <SectionHead title="System" baseline />
            {/* Both of these are derived from audit entries, which officers cannot read;
                recruitment comes from the committee list and is visible to everyone. */}
            {isAdmin && (
              <>
                <AttentionRow system label="One-click password" count={system.oneClickRotated} />
                <AttentionRow system label="Sheets sync" count={system.lastSync} />
              </>
            )}
            <AttentionRow system label="Recruitment cycle" count={system.recruitment} />
          </div>
        </div>
      </div>

      <ApiLegend />
    </>
  );
}

Overview.propTypes = {
  data: PropTypes.object.isRequired,
  isAdmin: PropTypes.bool.isRequired,
  onNavigate: PropTypes.func.isRequired,
};
