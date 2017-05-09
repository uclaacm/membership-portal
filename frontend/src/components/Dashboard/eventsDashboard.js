import React, { PropTypes } from 'react'
import Button from 'components/Button/index'
import EarlierEventsIcon from './earlierEventsIcon'
import EventDay from './eventDay'

class EventsDashboard extends React.Component {
    render () {
        const events = [{date: "Wednesday, April 19th", imgUrl: "imgUrl", org: "ACM Hack", time: "6:15pm-8:15pm", title: "Hack Sprint Session 1",                   location: "Sproul Lecture Room"}, 
                        {date: "Thursday, April 20th", imgUrl: "imgUrl", org: "ACM", time: "6:00pm-7:00pm", title: "How to Negotiate an Offer",     location: "Boelter 4760"}]
        return(
            <div className="events-dashboard">
                <EarlierEventsIcon/>
                <Button className="checkin-button" style="blue" text="Check In"/>
                <EventDay date="Wednesday, April 19th"/>
                <EventDay date="Thursday, April 20th"/>
            </div>
        );
    }
}

export default EventsDashboard;
