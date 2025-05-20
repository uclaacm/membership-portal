import React from 'react';
import EventCard from './eventCard';

export default class EventDay extends React.Component {
  render() {
    return (
      <div className="event-day">
        <div className="event-grid">
          {this.props.events.map((event, i) => (
            <EventCard event={event} key={event.uuid} />
          ))}
        </div>
      </div>
    );
  }
}
