import React, { PropTypes } from 'react'
import EventTile from './eventTile'
import EventDropdown from './eventDropdown'

class EventDay extends React.Component {
    render () {
      console.log(this.props.singleDayEventsList.events);
      const eventsForTheDay = this.props.singleDayEventsList.events;
        return(
            <div className="event-day">
                <p className="Display-2Primary">{this.props.singleDayEventsList.date}</p>
                {
                    eventsForTheDay.map(function(ev, i) {
                        return <div>
                                  <EventTile event={ev} key={i}/>
                                  <EventDropdown/>
                               </div>
                    })
                }

            </div>
        );
    }
}

export default EventDay;


