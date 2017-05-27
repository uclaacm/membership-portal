import React, { PropTypes } from 'react'
import Button from 'components/Button/index'
import EarlierEventsIcon from './earlierEventsIcon'
import EventDay from './eventDay'

class EventsDashboard extends React.Component {

    renderError(error) {
        return(
            <div className="events-dashboard">
                <h1>{error}</h1>
            </div>
        );
    }
    render () {
        if (this.props.error) {
            this.renderError(this.props.error);
        } else {
            const fullEventsList = this.props.events;
            return(
                <div className="events-dashboard">
                    <EarlierEventsIcon/>
                    <Button className="checkin-button" style="blue" text="Check In"/>
                    {
                        fullEventsList.map(function(singleDay, i) {
                            return <EventDay day={singleDay} key={i}/>
                        })
                    }
                </div>
            );
        }
    }
}

export default EventsDashboard;
