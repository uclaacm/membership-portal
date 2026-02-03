import React from 'react';
import Link from 'next/link';

const FeaturedEvents = ({ title, events }) => (
  <>
    <div className="featured-events">
      <div className="title-container">
        <h1>{title}</h1>
        <Link href="/events">All Events</Link>
      </div>

      <div className="events-container">
        {events.map(event => event)}
      </div>
    </div>
  </>
);

export default FeaturedEvents;
