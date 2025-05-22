import React from 'react';

const FeaturedEvents = ({ title, events }) => (
  <>
    <div className="featured-events">
      <div className="title-container">
        {title}
      </div>

      <div className="events-container">
        {events.map(event => event)}
      </div>
    </div>
  </>
);

export default FeaturedEvents;
