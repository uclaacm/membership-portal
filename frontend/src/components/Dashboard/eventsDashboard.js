import React, { PropTypes } from 'react'
import Button from 'components/Button/index'
import EarlierEventsIcon from './earlierEventsIcon'
import EventDay from './eventDay'

class EventsDashboard extends React.Component {
    render () {
        const fullEventsList = this.props.events;
        // console.log(this.props.events.length);
        // for(let i = 0; i < this.props.events.length; i++) {
        //     console.log(this.props.events[i]);
        // }
        // console.log(this.props.events[0]);

        return(
            <div className="events-dashboard">
                <EarlierEventsIcon/>
                <Button className="checkin-button" style="blue" text="Check In"/>
                {/*Map the entire json object... will have to update this later.*/}
                {
                    fullEventsList.map(function(singleDay, i) {
                        return <EventDay singleDayEventsList={singleDay} key={i}/>
                    })
                }


                {/*<EventDay date="Wednesday, April 19th"/>
                <EventDay date="Thursday, April 20th"/>*/}
            </div>
        );
    }
}

export default EventsDashboard;
