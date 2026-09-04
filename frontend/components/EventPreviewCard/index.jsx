'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import Config from '@/lib/config';
import './style.scss';

/**
 * Strips stored HTML down to readable text for the card's back face.
 *
 * Descriptions come from a rich-text field, so they arrive as markup. Falls back to a regex
 * pass when DOMParser is unavailable (server render).
 */
const plainText = (description) => {
  if (description == null) return '';
  const text = String(description)
    .replace(/<\s*br\s*\/?\s*>/gi, '\n')
    .replace(/<\s*\/\s*p\s*>/gi, '\n\n')
    .replace(/<\s*\/\s*div\s*>/gi, '\n\n');

  if (typeof DOMParser === 'undefined') {
    return text.replace(/<[^>]*>/g, '').replace(/\n{3,}/g, '\n\n').trim();
  }
  const doc = new DOMParser().parseFromString(text, 'text/html');
  return (doc.body.textContent || '').replace(/\n{3,}/g, '\n\n').trim();
};

/**
 * The vertical event card, shared by the home dashboard, the events list, and the event form's
 * live preview.
 *
 * Extracted from `adminAddEvent.js` so there is exactly one event card in the product; it was
 * previously reachable only from inside that file, with styles nested under `.admin-dashboard`.
 *
 * The cover falls back to the committee banner and then the logo — most stored covers are dead
 * links, so that path does real work.
 *
 * @param fill  stretch to the container's width. Only for a *grid* parent: in the events
 *   page's wrapping flexbox a full-width card takes a whole row and the cards stack.
 */
export default function EventPreviewCard({
  event, fill, onRsvp, going, flippable,
  admin, rsvpCount, onEdit, onViewRsvps, rsvpsOpen, rsvpsLoading,
}) {
  const banner = Config.committeeBanners[event.committee] || '/logo.png';
  const [src, setSrc] = useState(event.cover || banner);
  const [flipped, setFlipped] = useState(false);

  const committeeColors = Object.fromEntries(Config.committeeColors);
  const committee = event.committee || 'ACM';
  const color = committeeColors[committee] || '#1E6CFF';

  const start = event.startDate ? moment(event.startDate) : null;
  const end = event.endDate ? moment(event.endDate) : null;

  let when = 'Date TBD';
  if (start && end) {
    when = `${start.format('MMM D, YYYY')}, ${start.format('h:mm a')} – ${end.format('h:mm a')}`;
  } else if (start) {
    when = start.format('MMM D, YYYY, h:mm a');
  }

  const description = plainText(event.description);
  // In admin mode a click edits the event — that is what the old admin tile did, and it would
  // be ambiguous for the same click to also flip the card.
  const canFlip = flippable && !!description && !admin;

  let onFaceClick;
  let faceTitle;
  if (admin) {
    onFaceClick = () => onEdit && onEdit(event);
    faceTitle = 'Click to edit this event';
  } else if (canFlip) {
    onFaceClick = () => setFlipped(true);
    faceTitle = 'Click to see description';
  }

  // Staff do not RSVP from the management view, so the pill's slot carries the attendance code
  // instead — the thing an officer actually needs at a glance while running the event.
  let pill = <div className="preview-rsvp-pill">RSVP</div>;
  if (admin) {
    pill = event.attendanceCode ? (
      <div className="preview-rsvp-pill is-code" title="Attendance code">{event.attendanceCode}</div>
    ) : null;
  } else if (onRsvp) {
    pill = (
      <button
        type="button"
        className="preview-rsvp-pill"
        // The card flips on click, so the button must not bubble into it.
        onClick={(e) => { e.stopPropagation(); onRsvp(event); }}
        style={going ? { background: 'rgba(52,220,106,0.18)', color: '#248a45' } : undefined}
      >
        {going ? 'Going' : 'RSVP'}
      </button>
    );
  }

  const card = (
    <div className={`preview-card-container ${fill ? 'fill' : ''} ${flipped ? 'is-flipped' : ''}`}>
      <div className="preview-card-flipper">
        <div
          className={`preview-card preview-card-front${admin ? ' is-admin' : ''}`}
          onClick={onFaceClick}
          style={onFaceClick ? { cursor: 'pointer' } : undefined}
          title={faceTitle}
        >
          <div className="preview-image-container">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt=""
              onError={() => setSrc((current) => (current === banner ? '/logo.png' : banner))}
            />
            <div className="preview-points-pill">{event.attendancePoints ?? 0} PTS</div>
          </div>

          <div className="preview-text-container">
            <p className="preview-title">{event.title || 'Event Title'}</p>
            <p className="preview-meta">🗓️ {when}</p>
            <p className="preview-meta">📍 {event.location || 'Location TBD'}</p>
            <p className="preview-meta" style={{ color }}>{committee}</p>
            {pill}
          </div>
        </div>

        {canFlip && (
          <div className="preview-card preview-card-back">
            <div className="preview-back-content">
              <button type="button" className="preview-flip-back-btn" onClick={() => setFlipped(false)}>
                <i className="fa fa-arrow-left" aria-hidden="true" /> Back
              </button>
              <h3>{event.title}</h3>
              <div className="preview-description-scroll">
                <p>{description}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Non-admin callers get exactly the markup they always got — no wrapper, no extra nodes.
  if (!admin) return card;

  const hasExternalRsvp = !!event.eventLink;

  let rsvpButtonText = 'View All RSVPs';
  if (rsvpsLoading) {
    rsvpButtonText = 'Loading…';
  } else if (rsvpsOpen) {
    rsvpButtonText = 'Hide RSVPs';
  }

  return (
    <div className="preview-card-shell">
      {card}
      <div className="preview-admin-bar">
        {hasExternalRsvp ? (
          <a
            className="preview-admin-external"
            href={event.eventLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            External RSVP <i className="fa fa-external-link-alt" aria-hidden="true" />
          </a>
        ) : (
          <>
            {/* Capacity is optional, so a null must read as a plain count rather than "42/0" —
                the denominator only appears when a limit is actually set. */}
            <span className="preview-admin-count">
              {event.capacity ? `${rsvpCount || 0}/${event.capacity}` : (rsvpCount || 0)}
              {' '}
              RSVP{(rsvpCount || 0) === 1 ? '' : 's'}
            </span>
            {onViewRsvps && (
              <button
                type="button"
                className="preview-admin-btn"
                onClick={onViewRsvps}
                disabled={rsvpsLoading}
              >
                {rsvpButtonText}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

EventPreviewCard.propTypes = {
  event: PropTypes.object.isRequired,
  fill: PropTypes.bool,
  onRsvp: PropTypes.func,
  going: PropTypes.bool,
  flippable: PropTypes.bool,
  /** Renders the staff footer strip and makes a card click edit rather than flip. */
  admin: PropTypes.bool,
  rsvpCount: PropTypes.number,
  onEdit: PropTypes.func,
  onViewRsvps: PropTypes.func,
  rsvpsOpen: PropTypes.bool,
  rsvpsLoading: PropTypes.bool,
};

EventPreviewCard.defaultProps = {
  fill: false,
  onRsvp: null,
  going: false,
  flippable: true,
  admin: false,
  rsvpCount: 0,
  onEdit: null,
  onViewRsvps: null,
  rsvpsOpen: false,
  rsvpsLoading: false,
};
