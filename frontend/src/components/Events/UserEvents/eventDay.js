import React from 'react'
import Event from './event'

export default class EventDay extends React.Component {
    render() {
        return (
            <div className="event-day">
                <h1 className="Display-2Primary date-day">{this.props.day.date.format('dddd, MMMM Do')}</h1>
                { this.props.day.events.map((ev, i) => <Event event={ev} key={i} />) }
            </div>
        );
    }
}