import React, { PropTypes } from 'react'
import EventTile from './eventTile'
import EventCard from './eventCard'
import EventDropdown from './eventDropdown'

class EventDay extends React.Component {
    render () {
        const day = this.props.day;
        return(
            <div className="event-day">
                <h1>{day.dateStr}</h1>
                {
                    day.events.map(function(ev, i) {
                        return <EventCard event={ev} key={i} />;
                    })
                }
            </div>
        );
    }
}

export default EventDay;
