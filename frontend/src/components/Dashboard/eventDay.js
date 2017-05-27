import React, { PropTypes } from 'react'
import EventTile from './eventTile'
import EventCard from './eventCard'
import EventDropdown from './eventDropdown'

class EventDay extends React.Component {
    render () {
        return(
            <div className="event-day">
                <h1><div className="circle">{this.props.singleDayEventsList.dateDigit}</div>{this.props.singleDayEventsList.date}</h1>
                {
                    this.props.singleDayEventsList.events.map(function(ev, i) {
                        return <EventCard event={ev} key={i} />;
                    })
                }
            </div>
        );
    }
}

export default EventDay;
