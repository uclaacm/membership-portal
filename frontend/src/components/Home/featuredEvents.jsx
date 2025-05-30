import React from 'react';
import { Link } from 'react-router-dom';

const FeaturedEvents = ({ title, events }) => (
  <>
    <div className="featured-events">
      <div className="title-container">
        <h1>{title}</h1>
        <Link to="/events">All Events</Link>
      </div>

      <div className="events-container">
        {events.map(event => event)}
      </div>
    </div>
  </>
);

export default FeaturedEvents;
