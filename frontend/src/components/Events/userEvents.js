import React from 'react'

import Button from 'components/Button/index'
import OverlayPopup from 'components/OverlayPopup'

import EventDay from './eventDay'
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
        this.setState(prev => ({
            showCheckIn: true
        }));
    }

    hideCheckIn(e) {
        console.log(e);
        this.setState(prev => ({
            showCheckIn: false
        }));
    }

    submitCheckIn(e) {
        console.log(e);
        e.preventDefault();
    }

    render () {
        if (this.props.error)
            return (<div className="events-dashboard"><h1>{this.props.error}</h1></div>);
        return (
            <div className="events-dashboard">
                <OverlayPopup
                    onCancel={ this.hideCheckIn }
                    onSubmit={ this.submitCheckIn }
                    showing={ this.state.showCheckIn }
                    title="Enter the Attendance Code"
                    submitText="Submit">
                    <form onSubmit={ this.submitCheckIn }>
                        <input type="text" placeholder="Attendance code..." /><br />
                        { this.props.checkInError ? <span className="CaptionSecondary error">{ this.props.checkInError }</span> : <span className="CaptionSecondary error">&nbsp;</span> }
                    </form>
                </OverlayPopup>

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