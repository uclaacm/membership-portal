'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import Config from '@/lib/config';
import './style.scss';

/**
 * The shared event card.
 *
 * Built once and used by both the events page and the home dashboard — previously the same
 * object had three treatments (member card, legacy admin row, dashboard featured strip), so an
 * officer reviewing an event saw something different from the member who RSVP'd to it.
 *
 * The role changes the affordances on the card, never the layout of the page:
 *   member  → RSVP / Going pill, "42 going"
 *   staff   → RSVPs button, "42/60 RSVPs", edit + delete when they may modify it
 *
 * @param canModify  admin anywhere, officer only inside their own committees. Computed by the
 *   caller from `userProfile.committees` so the rule lives next to the permission matrix.
 * @param compact    dashboard sizing — a 104px cover instead of 132px. Nothing else differs.
 */
export default function EventCard({
  event, staff, canModify, compact,
  rsvpCount, checkedInCount, going,
  onRsvp, onViewRsvps, onEdit, onDelete,
}) {
  const committeeColors = Object.fromEntries(Config.committeeColors);
  const committee = event.committee || 'ACM';
  const color = committeeColors[committee] || '#1d6bff';

  // Most stored covers are dead external links, so the fallback chain does real work. It has to
  // be an <img>: `background-image` cannot report a load failure, so a broken URL would just
  // leave the placeholder colour showing with no way to recover.
  const banner = Config.committeeBanners[committee] || '';
  const [src, setSrc] = useState(event.cover || banner);

  const onCoverError = () => setSrc((current) => (current === banner ? '' : banner));

  const start = event.startDate ? moment(event.startDate) : null;
  const end = event.endDate ? moment(event.endDate) : null;

  // Weekday first, and the end time collapses to just the clock when it lands on the same day.
  let when = 'Date TBD';
  if (start && end) {
    const sameDay = start.isSame(end, 'day');
    when = sameDay
      ? `${start.format('ddd MMM D')} · ${start.format('h:mm')} – ${end.format('h:mm a')}`
      : `${start.format('ddd MMM D, h:mm a')} – ${end.format('ddd MMM D, h:mm a')}`;
  } else if (start) {
    when = start.format('ddd MMM D · h:mm a');
  }

  const count = rsvpCount || 0;
  const attendance = staff
    ? `${count}${event.capacity ? `/${event.capacity}` : ''} RSVP${count === 1 ? '' : 's'}`
    : `${count} going`;

  return (
    <article className={`event-card${compact ? ' is-compact' : ''}`}>
      <div className="event-card__cover">
        {src && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt="" onError={onCoverError} />
        )}
        {staff && event.draft && <span className="event-card__draft">DRAFT</span>}
        <span className="event-card__points">{event.attendancePoints ?? 0} PTS</span>
      </div>

      <div className="event-card__body">
        <p className="event-card__committee" style={{ color }}>{committee}</p>
        <h3 className="event-card__title">{event.title || 'Untitled event'}</h3>

        <div className="event-card__meta">
          <i className="fa fa-clock" aria-hidden="true" />
          <span>{when}</span>
        </div>
        <div className="event-card__meta">
          <i className="fa fa-location-dot" aria-hidden="true" />
          <span>{event.location || 'Location TBD'}</span>
        </div>

        <div className="event-card__footer">
          <span className="event-card__attendance">
            {attendance}
            {staff && checkedInCount != null ? ` · ${checkedInCount} in` : ''}
          </span>

          <div className="event-card__actions">
            {canModify && onEdit && (
              <button
                type="button"
                className="event-card__icon-btn"
                title="Edit event"
                aria-label="Edit event"
                onClick={() => onEdit(event)}
              >
                <i className="fa fa-pen" aria-hidden="true" />
              </button>
            )}
            {canModify && onDelete && (
              <button
                type="button"
                className="event-card__icon-btn is-danger"
                title="Delete event"
                aria-label="Delete event"
                onClick={() => onDelete(event)}
              >
                <i className="fa fa-trash" aria-hidden="true" />
              </button>
            )}

            {staff ? (
              onViewRsvps && (
                <button
                  type="button"
                  className="event-card__pill-btn is-staff"
                  onClick={() => onViewRsvps(event)}
                >
                  RSVPs
                </button>
              )
            ) : (
              // An external link replaces the built-in RSVP entirely, matching the field's
              // "overrides built-in RSVP" contract in the create-event form.
              event.eventLink ? (
                <a
                  className="event-card__pill-btn is-rsvp"
                  href={event.eventLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  RSVP
                </a>
              ) : onRsvp && (
                <button
                  type="button"
                  className={`event-card__pill-btn ${going ? 'is-going' : 'is-rsvp'}`}
                  onClick={() => onRsvp(event)}
                >
                  {going ? 'Going' : 'RSVP'}
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

EventCard.propTypes = {
  event: PropTypes.object.isRequired,
  staff: PropTypes.bool,
  canModify: PropTypes.bool,
  compact: PropTypes.bool,
  rsvpCount: PropTypes.number,
  checkedInCount: PropTypes.number,
  going: PropTypes.bool,
  onRsvp: PropTypes.func,
  onViewRsvps: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
};

EventCard.defaultProps = {
  staff: false,
  canModify: false,
  compact: false,
  rsvpCount: 0,
  checkedInCount: null,
  going: false,
  onRsvp: null,
  onViewRsvps: null,
  onEdit: null,
  onDelete: null,
};
