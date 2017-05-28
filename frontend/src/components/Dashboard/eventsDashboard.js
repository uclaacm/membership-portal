import React, { PropTypes } from 'react'
import Button from 'components/Button/index'
import EarlierEventsIcon from './earlierEventsIcon'
import EventDay from './eventDay'

class EventsDashboard extends React.Component {
    render () {
        if (this.props.error) {
            return <div className="events-dashboard"><h1>{this.props.error}</h1></div>;
        } else {
            return(
                <div className="events-dashboard">
                    <EarlierEventsIcon/>
                    <Button className="checkin-button" style="blue collapsible" text="Check In" icon="fa-calendar-check-o" />
                    { this.props.events.map((day, i) => <EventDay day={day} key={i}/>) }
                </div>
            );
        }
    }
}

export default EventsDashboard;
