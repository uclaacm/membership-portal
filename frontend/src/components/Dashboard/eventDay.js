import React, { PropTypes } from 'react'
import EventTile from './eventTile'

class EventDay extends React.Component {
    render () {
      console.log(this.props.singleDayEventsList.events);
      const eventsForTheDay = this.props.singleDayEventsList.events;
        return(
            <div className="event-day">
                <p className="Display-2Primary">{this.props.singleDayEventsList.date}</p>
                {/*<EventTile img="https://scontent-lax3-1.xx.fbcdn.net/v/t31.0-8/18402016_1608383172535087_1018900285816195814_o.jpg?oh=7a2a342ed781da2dd4af501b5893ae65&oe=5976DF0D"
                  org="ACM Hack" time="6:00pm-7:00pm" title="Hack Sprint Session 1" location="Sproul Lecture Room"/>
                
                <EventTile img="https://scontent-lax3-1.xx.fbcdn.net/v/t31.0-8/18402016_1608383172535087_1018900285816195814_o.jpg?oh=7a2a342ed781da2dd4af501b5893ae65&oe=5976DF0D"
                  org="ACM" time="6:00pm-7:00pm" title="How to Negotiate an Offer" location="Boelter 4760"/>*/}
                
                {
                    eventsForTheDay.map(function(ev, i) {
                        return <EventTile event={ev} key={i}/>
                    })
                }

            </div>
        );
    }
}

export default EventDay;


