import React from 'react'
import EventCard from './eventCard'

export default class EventMonth extends React.Component {

    render () {
        var month;
        if(this.props.event.length > 0) 
            month = this.props.event[0].date.format('MMMM')
        console.log(month);
        return(
            <div className={"event-day" + (this.props.admin ? " admin-dashboard" : "")}>
                <h1 className="Display-2Primary date-month">{month}</h1>
                { this.props.event.map((ev, i) => <EventCard event={ev} key={i} admin={this.props.admin} onClick={this.props.onClick} />) }
            </div>
        );
    }
}