import React from 'react';
import EventCard from './eventCard';

export default class EventDay extends React.Component {
  render() {
    return (
      <div className="event-day">
        <h1 className="Display-2Primary date-day">{this.props.day.date.format("dddd, MMMM Do, YYYY")}</h1>
        {/*New div wrapper*/}
        <div className="event-grid">
          {this.props.day.events.map((event, i) => (
            <EventCard event={event} key={event.uuid} />
          ))}
        </div>
      </div>
    );
  }
}
