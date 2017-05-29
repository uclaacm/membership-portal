import React from 'react'

import Button from 'components/Button/index'
import EventDay from './eventDay'
import CheckInPopup from './checkInPopup'
import EarlierEventsIcon from './earlierEventsIcon'

export default class UserEvents extends React.Component {
    constructor(props) {
        super(props);
        this.state = { showCheckIn: false, checkInError: null };
        this.showCheckIn = this.showCheckIn.bind(this);
        this.hideCheckIn = this.hideCheckIn.bind(this);
        this.submitCheckIn = this.submitCheckIn.bind(this);
    }

    showCheckIn(e) {
        console.log(e);
        this.setState(prev => ({
            showCheckIn: true
        }));
    }

    hideCheckIn(e) {
        this.setState(prev => ({
            showCheckIn: false
        }));
    }

    submitCheckIn(e) {
        e.preventDefault();
    }

    render () {
        if (this.props.error) {
            return <div className="events-dashboard"><h1>{this.props.error}</h1></div>;
        } else {
            return (
                <div className="events-dashboard">
                    <CheckInPopup
                        cancelAction={ this.hideCheckIn }
                        submitAction={ this.submitCheckIn }
                        error={ this.state.checkInError }
                        showing={ this.state.showCheckIn } />
                    <EarlierEventsIcon />
                    <Button
                        className={ "checkin-button" + (this.state.showCheckIn ? " hidden" : "")}
                        style="blue collapsible"
                        icon="fa-calendar-check-o"
                        text="Check In"
                        onClick={ this.showCheckIn } />
                    { this.props.events.map((day, i) => <EventDay day={day} key={i} admin={false} />) }
                </div>
            );
        }
    }
}