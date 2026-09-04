'use client';

import React from 'react';
import Event from './event';

export default class EventDay extends React.Component {
  render() {
    return (
      <div className={`event-day${this.props.admin ? ' admin-dashboard' : ''}`}>
        <h2 className="date-day">{this.props.day.date.format('dddd, Do')}</h2>
        {/* Same wrapping grid the member view uses, so both surfaces lay the cards out
            identically instead of the admin side stacking one full-width row per event. */}
        <div className="event-grid">
          {this.props.day.events.map((event) => (
            <Event event={event} key={event.uuid} handleEditClick={this.props.handleEditClick} />
          ))}
        </div>
      </div>
    );
  }
}
