import React from 'react';
import { sanitize } from 'dompurify';
import Button from 'components/Button/index';

export default class EventCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = { selected: false };
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(e) {
    if (this.props.onClick) return this.props.onClick(e);
    this.setState(prev => ({
      selected: !prev.selected,
    }));
  }

  render() {
    const { event } = this.props;
    const className = `event-card user-card${this.state.selected ? ' selected' : ''}`;
    return (
      <div className="event-card" onClick={this.handleClick}>
        <div className="cover" style={{ backgroundImage: `linear-gradient(to bottom, #cce5ff, #005bea), url(${event.cover})` }}>
          <div className="points-container">
            <span className="points">{event.attendancePoints} PTS</span>
          </div>
          {this.props.event.checkedIn && (
            <div className="attended-container">
              <i className="fa fa-check-circle-o" />
              <span>Attended</span>
            </div>
          )}
        </div>
        <div className="content">
          <h2>{event.title}</h2>
          <h3>{event.committee}</h3>
          <div className="midcontent">
            <div className="description" dangerouslySetInnerHTML={{ __html: sanitize(event.description) }} />
            <p>
              <a target="_BLANK" href={event.eventLink} rel="noreferrer">
                Go to the event page
              </a>
            </p>
          </div>
          <div className="subcontent">
            <span className="time">
              {event.startDate.format('h:mm a')}
              {' '}
              &mdash;
              {event.endDate.format('h:mm a')}
            </span>
            <p className="location">{event.location}</p>
          </div>
        </div>
      </div>
    );
  }
}
