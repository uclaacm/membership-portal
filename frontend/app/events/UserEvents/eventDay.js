'use client';

import { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import EventPreviewCard from '@/components/EventPreviewCard';
import fetchUserRSVPs from '@/app/actions/rsvp/fetchUserRSVPs';
import createRSVP from '@/app/actions/rsvp/createRSVP';
import cancelRSVP from '@/app/actions/rsvp/cancelRSVP';

/**
 * A day's worth of events, rendered with the shared vertical card.
 *
 * RSVP state is fetched once here rather than by each card. The previous card fetched the
 * user's RSVPs and check-ins in its own componentDidMount, so a twenty-event day issued forty
 * requests to answer the same two questions.
 */
export default function EventDay({ events }) {
  const [rsvped, setRsvped] = useState({});

  useEffect(() => {
    let active = true;
    const load = async () => {
      const result = await fetchUserRSVPs();
      if (!active || !result.success) return;
      setRsvped(Object.fromEntries(
        (result.rsvps ?? []).map((r) => [r.event?.uuid ?? r.event, true]),
      ));
    };
    load();
    return () => { active = false; };
  }, []);

  const toggle = useCallback(async (event) => {
    const going = !!rsvped[event.uuid];
    // Optimistic: the button is the feedback, and waiting on a round trip reads as broken.
    setRsvped((current) => ({ ...current, [event.uuid]: !going }));

    const result = going ? await cancelRSVP(event.uuid) : await createRSVP(event.uuid);
    if (!result.success) setRsvped((current) => ({ ...current, [event.uuid]: going }));
  }, [rsvped]);

  return (
    <div className="event-day">
      <div className="event-grid">
        {events.map((event) => (
          <EventPreviewCard
            key={event.uuid}
            event={event}
            going={!!rsvped[event.uuid]}
            onRsvp={toggle}
          />
        ))}
      </div>
    </div>
  );
}

EventDay.propTypes = { events: PropTypes.arrayOf(PropTypes.object).isRequired };
