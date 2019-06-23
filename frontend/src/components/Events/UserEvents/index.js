import React from 'react';

import Button from 'components/Button/index';
import OverlayPopup from 'components/OverlayPopup';

import EarlierEventsIcon from 'components/Events/earlierEventsIcon';
import EventDay from './eventDay';

export default class UserEvents extends React.Component {
  constructor(props) {
    super(props);
    this.state = { showCheckIn: false, showEarlierEvents: false };
    this.showCheckIn = this.showCheckIn.bind(this);
    this.hideCheckIn = this.hideCheckIn.bind(this);
    this.submitCheckIn = this.submitCheckIn.bind(this);
    this.showEarlierEvents = this.showEarlierEvents.bind(this);
    this.renderAttendanceForm = this.renderAttendanceForm.bind(this);
    this.renderCheckInSuccess = this.renderCheckInSuccess.bind(this);
    this.renderCheckInFailure = this.renderCheckInFailure.bind(this);
    this.resetCheckIn = this.resetCheckIn.bind(this);
    this.tryAgain = this.tryAgain.bind(this);
  }

  showCheckIn(e) {
    this.setState(prev => ({
      showCheckIn: true,
      showEarlierEvents: prev.showEarlierEvents,
    }));
  }

  hideCheckIn(e) {
    this.setState(prev => ({
      showCheckIn: false,
      showEarlierEvents: prev.showEarlierEvents,
    }));
  }

  showEarlierEvents(e) {
    this.setState(prev => ({
      showCheckIn: prev.showCheckIn,
      showEarlierEvents: true,
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
    e.preventDefault();
    this.props.checkIn(this.refs.attendanceCode.value);
  }

  renderAttendanceForm() {
    return (
      <OverlayPopup
        onCancel={this.hideCheckIn}
        onSubmit={this.submitCheckIn}
        showing={this.state.showCheckIn && !this.props.checkInSubmitted}
        title="Enter the Attendance Code"
        submitText="Submit"
      >
        <form onSubmit={this.submitCheckIn}>
          <input type="text" placeholder="Attendance code..." ref="attendanceCode" />
          <br />
          { this.props.checkInError ? <span className="CaptionSecondary error">{ this.props.checkInError }</span> : <span className="CaptionSecondary error">&nbsp;</span> }
        </form>
      </OverlayPopup>
    );
  }

  renderCheckInFailure() {
    return (
      <OverlayPopup
        title={this.props.checkInError}
        showing={this.props.checkInSubmitted && !this.props.checkInSuccess}
      >
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
        showing={this.props.checkInSubmitted && this.props.checkInSuccess}
      >
        <h2>
Awesome! You got
          <br />
          <span className="points">
            {this.props.checkInPoints}
            {' '}
points
          </span>
          <br />
for checking in.
        </h2>
        <div className="popup-buttons">
          <Button className="large-button popup-button popup-submit-button" style="green" text="OK!" onClick={this.resetCheckIn} />
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
    if (this.props.error) return (<div className="events-dashboard user-dashboard"><h1>{this.props.error}</h1></div>);

    const days = [];
    for (const event of this.props.events) {
      if (days.length === 0 || event.startDate.date() !== days[days.length - 1].date.date()) days.push({ date: event.startDate, events: [event] });
      else days[days.length - 1].events.push(event);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const pastDays = days.filter(day => day.date < today);
    const futureDays = days.filter(day => day.date >= today);

    return (
      <div className="events-dashboard user-dashboard">
        {this.renderAttendanceForm()}
        {this.renderCheckInSuccess()}
        {this.renderCheckInFailure()}
        { !this.state.showEarlierEvents && <EarlierEventsIcon onClick={this.showEarlierEvents} /> }
        { this.state.showEarlierEvents && pastDays.map((day, i) => <EventDay day={day} key={day.date.toString()} admin={false} />) }
        <Button
          className={`checkin-button${this.state.showCheckIn ? ' hidden' : ''}`}
          style="blue collapsible"
          icon="fa-calendar-check-o"
          text="Check In"
          onClick={this.showCheckIn}
        />
        { futureDays.map((day, i) => <EventDay day={day} key={day.date.toString()} admin={false} />) }
      </div>
    );
  }
}
