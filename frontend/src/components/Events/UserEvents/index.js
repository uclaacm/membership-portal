import React from 'react'

import Button from 'components/Button/index'
import OverlayPopup from 'components/OverlayPopup'

import EventDay from './eventDay'
import EarlierEventsIcon from 'components/Events/earlierEventsIcon'

export default class UserEvents extends React.Component {
    constructor(props) {
        super(props);
        this.state = { showCheckIn: false };
        this.showCheckIn = this.showCheckIn.bind(this);
        this.hideCheckIn = this.hideCheckIn.bind(this);
        this.submitCheckIn = this.submitCheckIn.bind(this);
        this.renderAttendanceForm = this.renderAttendanceForm.bind(this);
        this.renderCheckInSuccess = this.renderCheckInSuccess.bind(this);
        this.renderCheckInFailure = this.renderCheckInFailure.bind(this);
        this.resetCheckIn = this.resetCheckIn.bind(this);
        this.tryAgain = this.tryAgain.bind(this);
    }

    showCheckIn(e) {
        this.setState(prev => ({
            showCheckIn: true,
        }));
    }

    hideCheckIn(e) {
        console.log(e);
        this.setState(prev => ({
            showCheckIn: false,

        }));
    }

    resetCheckIn(e) {
        this.props.resetCheckIn();
    }

    tryAgain(e) {
        this.resetCheckIn();
        this.showCheckIn();
    }

    submitCheckIn(e) {
        console.log(e);
        e.preventDefault();
        this.props.checkIn(this.refs.attendanceCode.value);
    }

    renderAttendanceForm() {
        return (
            <OverlayPopup
                onCancel={ this.hideCheckIn }
                onSubmit={ this.submitCheckIn }
                showing={ this.state.showCheckIn && !this.props.checkInSubmitted }
                title={"Enter the Attendance Code"}
                submitText="Submit">
                <form onSubmit={ this.submitCheckIn } >
                    <input type="text" placeholder="Attendance code..." ref="attendanceCode" /><br />
                    { this.props.checkInError ? <span className="CaptionSecondary error">{ this.props.checkInError }</span> : <span className="CaptionSecondary error">&nbsp;</span> }
                </form>
            </OverlayPopup>
        );
    }

    renderCheckInFailure() {
        return (
            <OverlayPopup
                title={this.props.checkInError}
                showing={this.props.checkInSubmitted && !this.props.checkInSuccess}>
                <div className="popup-buttons">
                    <Button className="popup-button popup-submit-button" style="blue" text="Try Again" onClick={this.tryAgain} />
                    <Button className="popup-button popup-cancel-button" style="red" text="Cancel" onClick={this.resetCheckIn} />

                </div>

            </OverlayPopup>
        );
    }

    renderCheckInSuccess() {
        return (
            <OverlayPopup
                title="Awesome"
                showing={this.props.checkInSubmitted && this.props.checkInSuccess}>
                <div className="popup-buttons">
                    <Button className="popup-button popup-submit-button" style="green" text="Ok!" onClick={this.resetCheckIn} />
                </div>
            </OverlayPopup>
        );
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.checkInSubmitted) {
            this.hideCheckIn();
        }
    }

    render() {
        if (this.props.error)
            return (<div className="events-dashboard user-dashboard"><h1>{this.props.error}</h1></div>);

        let days =[];
        for (let event of this.props.events) {
            if (days.length === 0 || event.startDate.date() !== days[days.length - 1].date.date())
                days.push({ date: event.startDate, events: [event] });
            else
                days[days.length - 1].events.push(event);
        }

        return (
            <div className="events-dashboard user-dashboard">
                {this.renderAttendanceForm()}
                {this.renderCheckInSuccess()}
                {this.renderCheckInFailure()}
                <EarlierEventsIcon />
                <Button
                    className={ "checkin-button" + (this.state.showCheckIn ? " hidden" : "")}
                    style="blue collapsible"
                    icon="fa-calendar-check-o"
                    text="Check In"
                    onClick={ this.showCheckIn } />
                { days.map((day, i) => <EventDay day={day} key={i} admin={false} />) }
            </div>
        );
    }
}
