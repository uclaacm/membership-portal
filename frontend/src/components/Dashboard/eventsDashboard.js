import React, { PropTypes } from 'react'
import Button from 'components/Button/index'
import EarlierEventsIcon from './earlierEventsIcon'
import EventDay from './eventDay'

class EventsDashboard extends React.Component {
    render () {
        const fullEventsList = this.props.events;
        return(
            <div className="events-dashboard">
                <EarlierEventsIcon/>
                <Button className="checkin-button" style="blue" text="Check In"/>
                {
                    fullEventsList.map(function(singleDay, i) {
                        return <EventDay singleDayEventsList={singleDay} key={i}/>
                    })
                }
            </div>
        );
    }
}

export default EventsDashboard;
