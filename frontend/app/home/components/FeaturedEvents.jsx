'use client';

import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import Config from '@/lib/config';
import EventPreviewCard from '@/components/EventPreviewCard';

const committeeColor = (committee, map) => map[committee] || map.ACM || '#1d6bff';

const bannerFor = (event) => Config.committeeBanners[event.committee] || null;

/**
 * Cover art for an event, as a real <img> rather than a background.
 *
 * A background-image cannot report failure, and most event covers in the wild are dead links —
 * Drive view pages, moved CDN paths — so a coverless-only fallback never fired and the card
 * showed a flat placeholder. An <img> gives us onError, which is the only reliable signal that
 * the committee banner should take over.
 */
function Cover({ event, className }) {
  const banner = bannerFor(event);
  const [src, setSrc] = useState(event.cover || banner);

  if (!src) return <div className={className} />;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={className}
      src={src}
      alt=""
      loading="lazy"
      onError={() => setSrc((current) => (current === banner ? null : banner))}
    />
  );
}

Cover.propTypes = { event: PropTypes.object.isRequired, className: PropTypes.string.isRequired };

function RsvpButton({ going, onToggle, inCard }) {
  return (
    <button
      type="button"
      className={`dash-rsvp ${inCard ? 'in-card' : ''} ${going ? 'is-going' : ''}`}
      onClick={onToggle}
    >
      {going ? 'Going' : 'RSVP'}
    </button>
  );
}

RsvpButton.propTypes = {
  going: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  inCard: PropTypes.bool,
};

RsvpButton.defaultProps = { inCard: false };

/**
 * Featured events — one ordered list rendered as two bands.
 *
 * Cards take items 0..cards-1 and rows take cards..cards+rows-1, so no event can appear twice.
 * Both bands size themselves to what fits; neither scrolls. Anything excluded is reachable via
 * "All events", which is why no scroller is needed.
 */
export default function FeaturedEvents({
  cardsRef, rowsRef, events, cardCount, rowCount, rsvped, onToggleRsvp,
}) {
  const colors = useMemo(() => Object.fromEntries(Config.committeeColors), []);

  const cards = events.slice(0, cardCount);
  const rows = events.slice(cardCount, cardCount + rowCount);
  // Nothing left over for the row band means the section has no reason to fill the column.
  const isShort = rows.length === 0;

  return (
    <section className={`dash-card dash-events ${isShort ? 'is-short' : ''}`} style={{ order: 3 }}>
      <div className="dash-events-head">
        <span className="dash-label">Featured events</span>
        <a className="dash-viewall" href="/events">All events</a>
      </div>

      {events.length === 0 && <p className="dash-empty">No upcoming events</p>}

      {/* Always mounted, even with nothing to show: the card count is measured from this
          container's width, and a container that only appears once data arrives can never be
          measured in time to decide how much data to ask for. */}
      <div
        className="dash-event-cards"
        ref={cardsRef}
        style={{ gridTemplateColumns: `repeat(${Math.max(1, cardCount)}, minmax(0, 1fr))` }}
      >
        {cards.map((event) => (
          <EventPreviewCard
            key={event.uuid}
            event={event}
            fill
            going={!!rsvped[event.uuid]}
            onRsvp={onToggleRsvp}
          />
        ))}
      </div>

      {/* The divider is rendered whenever the row band can hold anything, so the two bands
          never run together visually even if the row list turns out empty. */}
      {rowCount > 0 && rows.length > 0 && (
        <div className="dash-events-divider">
          <span className="dash-label">Also coming up</span>
          <span className="dash-rule" />
        </div>
      )}

      <div className="dash-event-rows" ref={rowsRef}>
        {rows.map((event) => (
          <article className="dash-event-row" key={event.uuid}>
            <div className="dash-event-thumb">
              <Cover event={event} className="dash-event-cover" />
            </div>
            <div className="dash-event-rowbody">
              <h3 className="dash-event-rowtitle">{event.title}</h3>
              <span className="dash-event-meta">
                <b style={{ color: committeeColor(event.committee, colors) }}>
                  {event.committee || 'ACM'}
                </b>
                {' · '}
                {moment(event.startDate).format('MMM D, h:mm a')}
              </span>
            </div>
            <div className="dash-event-rowright">
              <span className="dash-event-rowpts">{event.attendancePoints ?? 0} pts</span>
              <RsvpButton
                going={!!rsvped[event.uuid]}
                onToggle={() => onToggleRsvp(event)}
              />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

FeaturedEvents.propTypes = {
  cardsRef: PropTypes.object.isRequired,
  rowsRef: PropTypes.object.isRequired,
  events: PropTypes.arrayOf(PropTypes.object).isRequired,
  cardCount: PropTypes.number.isRequired,
  rowCount: PropTypes.number.isRequired,
  rsvped: PropTypes.object.isRequired,
  onToggleRsvp: PropTypes.func.isRequired,
};
