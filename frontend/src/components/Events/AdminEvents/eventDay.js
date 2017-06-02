import React from 'react'
import Event from './event'

export default class EventDay extends React.Component {
    render() {
        return (
            <div className={"event-day" + (this.props.admin ? " admin-dashboard" : "")}>
                <h2 className="date-day">{this.props.day.date.format('dddd, Do')}</h2>
                { this.props.day.events.map((ev, i) => <Event event={ev} key={i} handleEditClick={this.props.handleEditClick} />) }
            </div>
        );
    }
}