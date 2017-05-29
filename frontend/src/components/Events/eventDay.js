import React from 'react'
import EventCard from './eventCard'

export default class EventDay extends React.Component {
    render () {
        return(
            <div className={"event-day" + this.props.admin ? " admin-dashboard" : ""}>
                <h1 className="Display-2Primary">{this.props.day.dateStr}</h1>
                { this.props.day.events.map((ev, i) => <EventCard event={ev} key={i} admin={this.props.admin} onClick={this.props.onClick} />) }
            </div>
        );
    }
}