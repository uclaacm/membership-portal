'use client';

import { useMemo } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import Config from '@/lib/config';
import './style.scss';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Two chips is the cap that keeps every cell the same height. Raising it means raising
// `min-height` on the day cell too, or the grid goes ragged.
const CHIPS_PER_DAY = 2;

const isoOf = (m) => m.format('YYYY-MM-DD');

/**
 * The month grid and day panel.
 *
 * Deliberately takes an already-filtered `events` array rather than filtering itself: the day
 * map, the month count, and the day panel all have to derive from the same list the cards view
 * groups by month, or the two views drift apart.
 *
 * Range is *not* applied here — the visible month already answers "upcoming or past", and a
 * range filter fighting month navigation just produces empty grids. Search and committee still
 * apply, so narrowing to Hack narrows the calendar too.
 */
export default function EventsCalendar({
  events, month, year, selectedDay,
  onSelectDay, onStepMonth, onToday,
  staff, canModify, rsvpedUuids,
  onRsvp, onViewRsvps, onEdit,
}) {
  const committeeColors = useMemo(() => Object.fromEntries(Config.committeeColors), []);
  const colorFor = (committee) => committeeColors[committee || 'ACM'] || '#1d6bff';

  const todayIso = isoOf(moment());

  // One pass over the filtered list; every derived value below reads from this map.
  const byDay = useMemo(() => {
    const map = new Map();
    events.forEach((event) => {
      const key = isoOf(event.startDate);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(event);
    });
    map.forEach((list) => list.sort((a, b) => a.startDate.valueOf() - b.startDate.valueOf()));
    return map;
  }, [events]);

  // A full 6×7-capable range: leading blanks for the first weekday offset, trailing days to
  // fill out the last week.
  const weeks = useMemo(() => {
    const first = moment({ year, month, day: 1 });
    const daysInMonth = first.daysInMonth();
    const leading = first.day();
    const totalCells = Math.ceil((leading + daysInMonth) / 7) * 7;

    const cells = [];
    for (let i = 0; i < totalCells; i += 1) {
      const date = first.clone().add(i - leading, 'days');
      const iso = isoOf(date);
      const dayEvents = byDay.get(iso) || [];
      cells.push({
        iso,
        num: date.date(),
        inMonth: date.month() === month,
        isToday: iso === todayIso,
        isSelected: iso === selectedDay,
        chips: dayEvents.slice(0, CHIPS_PER_DAY),
        overflow: Math.max(0, dayEvents.length - CHIPS_PER_DAY),
      });
    }

    const out = [];
    for (let i = 0; i < cells.length; i += 7) out.push(cells.slice(i, i + 7));
    return out;
  }, [byDay, month, year, selectedDay, todayIso]);

  const monthCount = useMemo(() => events.filter((event) => (
    event.startDate.year() === year && event.startDate.month() === month
  )).length, [events, month, year]);

  const selected = moment(selectedDay, 'YYYY-MM-DD');
  const dayEvents = byDay.get(selectedDay) || [];

  return (
    <div className="events-calendar">
      <div className="events-calendar__main">
        <div className="events-calendar__header">
          <button
            type="button"
            className="events-calendar__nav"
            aria-label="Previous month"
            onClick={() => onStepMonth(-1)}
          >
            <i className="fa fa-chevron-left" aria-hidden="true" />
          </button>
          <button
            type="button"
            className="events-calendar__nav"
            aria-label="Next month"
            onClick={() => onStepMonth(1)}
          >
            <i className="fa fa-chevron-right" aria-hidden="true" />
          </button>

          <h2 className="events-calendar__title">
            {moment({ year, month, day: 1 }).format('MMMM YYYY')}
          </h2>
          <span className="events-calendar__count">
            {monthCount} event{monthCount === 1 ? '' : 's'}
          </span>

          <button type="button" className="events-calendar__today" onClick={onToday}>
            Today
          </button>
        </div>

        {/* Seven columns crush below ~660px, so the grid scrolls inside its own container
            rather than shrinking. */}
        <div className="events-calendar__scroll">
          <div className="events-calendar__panel">
            <div className="events-calendar__weekdays">
              {WEEKDAYS.map((day) => (
                <div key={day} className="events-calendar__weekday">{day}</div>
              ))}
            </div>

            {weeks.map((week) => (
              <div className="events-calendar__week" key={week[0].iso}>
                {week.map((cell) => (
                  <div
                    key={cell.iso}
                    role="gridcell"
                    tabIndex={0}
                    aria-selected={cell.isSelected}
                    className={[
                      'events-calendar__day',
                      cell.inMonth ? '' : 'is-outside',
                      cell.isSelected ? 'is-selected' : '',
                    ].filter(Boolean).join(' ')}
                    onClick={() => onSelectDay(cell.iso)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSelectDay(cell.iso);
                      }
                    }}
                  >
                    <div className="events-calendar__day-head">
                      <span
                        className={`events-calendar__day-num${cell.isToday || cell.isSelected ? ' is-accent' : ''}`}
                      >
                        {cell.num}
                      </span>
                      {cell.isToday && <span className="events-calendar__today-marker">Today</span>}
                    </div>

                    {cell.chips.map((event) => (
                      <div
                        key={event.uuid}
                        className="events-calendar__chip"
                        style={{ borderLeftColor: colorFor(event.committee) }}
                        title={event.title}
                      >
                        <span className="events-calendar__chip-title">{event.title}</span>
                        <span className="events-calendar__chip-time">
                          {event.startDate.format('h:mm a')}
                        </span>
                      </div>
                    ))}

                    {cell.overflow > 0 && (
                      <span className="events-calendar__more">+{cell.overflow} more</span>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Not a read-only summary: every action on a card is available here too, so a member can
          RSVP and an officer can open the editor without switching views. */}
      <aside className="events-calendar__day-panel">
        <div>
          <p className="events-calendar__day-panel-label">
            {selectedDay === todayIso ? 'Today' : selected.format('dddd')}
          </p>
          <p className="events-calendar__day-panel-date">{selected.format('MMMM D, YYYY')}</p>
        </div>

        {dayEvents.length === 0 ? (
          <p className="events-calendar__day-panel-empty">
            Nothing scheduled. Pick another day, or step through the months to find the next
            event.
          </p>
        ) : dayEvents.map((event) => {
          const going = !!rsvpedUuids[event.uuid];
          const count = event.rsvpCount || 0;
          const meta = staff
            ? `${count}${event.capacity ? `/${event.capacity}` : ''} RSVP${count === 1 ? '' : 's'}`
            : `${count} going`;

          return (
            <div className="events-calendar__entry" key={event.uuid}>
              <span
                className="events-calendar__entry-committee"
                style={{ color: colorFor(event.committee) }}
              >
                {event.committee || 'ACM'}
              </span>
              <h3 className="events-calendar__entry-title">{event.title}</h3>

              <div className="events-calendar__entry-meta">
                <i className="fa fa-clock" aria-hidden="true" />
                <span>
                  {event.startDate.format('h:mm')} – {event.endDate.format('h:mm a')}
                </span>
              </div>
              <div className="events-calendar__entry-meta">
                <i className="fa fa-location-dot" aria-hidden="true" />
                <span>{event.location || 'Location TBD'}</span>
              </div>

              <div className="events-calendar__entry-footer">
                <span className="events-calendar__entry-count">
                  {meta} · {event.attendancePoints ?? 0} pts
                </span>
                <div className="events-calendar__entry-actions">
                  {canModify(event) && (
                    <button
                      type="button"
                      className="events-calendar__icon-btn"
                      aria-label="Edit event"
                      title="Edit event"
                      onClick={() => onEdit(event)}
                    >
                      <i className="fa fa-pen" aria-hidden="true" />
                    </button>
                  )}

                  {staff ? (
                    <button
                      type="button"
                      className="events-calendar__pill is-staff"
                      onClick={() => onViewRsvps(event)}
                    >
                      RSVPs
                    </button>
                  ) : event.eventLink ? (
                    <a
                      className="events-calendar__pill is-rsvp"
                      href={event.eventLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      RSVP
                    </a>
                  ) : (
                    <button
                      type="button"
                      className={`events-calendar__pill ${going ? 'is-going' : 'is-rsvp'}`}
                      onClick={() => onRsvp(event)}
                    >
                      {going ? 'Going' : 'RSVP'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </aside>
    </div>
  );
}

EventsCalendar.propTypes = {
  events: PropTypes.array.isRequired,
  month: PropTypes.number.isRequired,
  year: PropTypes.number.isRequired,
  selectedDay: PropTypes.string.isRequired,
  onSelectDay: PropTypes.func.isRequired,
  onStepMonth: PropTypes.func.isRequired,
  onToday: PropTypes.func.isRequired,
  staff: PropTypes.bool,
  canModify: PropTypes.func.isRequired,
  rsvpedUuids: PropTypes.object,
  onRsvp: PropTypes.func,
  onViewRsvps: PropTypes.func,
  onEdit: PropTypes.func,
};

EventsCalendar.defaultProps = {
  staff: false,
  rsvpedUuids: {},
  onRsvp: null,
  onViewRsvps: null,
  onEdit: null,
};
