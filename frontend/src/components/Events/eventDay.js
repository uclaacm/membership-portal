import React from 'react'
import EventCard from './eventCard'

export default class EventDay extends React.Component {
    render () {
        return(
            <div className="event-day">
                <h1>{this.props.day.dateStr}</h1>
                { this.props.day.events.map((ev, i) => <EventCard event={ev} key={i} />) }
            </div>
        );
    }
}