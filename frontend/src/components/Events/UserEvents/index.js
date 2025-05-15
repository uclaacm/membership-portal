import React from 'react';

import Button from 'components/Button/index';
import OverlayPopup from 'components/OverlayPopup';

import EarlierEventsIcon from "components/Events/earlierEventsIcon";
import EventDay from "./eventDay";
import EventFilterBar from "../EventFilterBar";
import Config from "../../../config"


export default class UserEvents extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      showCheckIn: false, 
      showEarlierEvents: false,
      searchQuery: "",
      committee: "All Committees",
      timeRange: "Upcoming"
    };
    this.showCheckIn = this.showCheckIn.bind(this);
    this.hideCheckIn = this.hideCheckIn.bind(this);
    this.submitCheckIn = this.submitCheckIn.bind(this);
    this.showEarlierEvents = this.showEarlierEvents.bind(this);
    this.renderAttendanceForm = this.renderAttendanceForm.bind(this);
    this.renderCheckInSuccess = this.renderCheckInSuccess.bind(this);
    this.renderCheckInFailure = this.renderCheckInFailure.bind(this);
    this.resetCheckIn = this.resetCheckIn.bind(this);
    this.tryAgain = this.tryAgain.bind(this);
    this.handleSearchChange = this.handleSearchChange.bind(this);
    this.handleCommitteeChange = this.handleCommitteeChange.bind(this);
    this.handleTimeRangeChange = this.handleTimeRangeChange.bind(this);
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

  handleSearchChange(searchQuery) {
    this.setState({ searchQuery });
  }
  
  handleCommitteeChange(committee) {
    this.setState({ committee });
  }
  
  handleTimeRangeChange(timeRange) {
    this.setState({ timeRange });
  }

  filterEvents(events) {
    const { searchQuery, committee, timeRange } = this.state;
    console.log(timeRange)
    
    return events.filter(event => {
      // Filter by search query (title)
      const matchesSearch = searchQuery === "" || 
        event.title.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Filter by committee
      const matchesCommittee = committee === "All Committees" || 
        event.committee === committee;
      
      // Filter by time range
      let matchesTimeRange = true;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      switch(timeRange) {
        case "Past Events":
          matchesTimeRange = event.startDate.isBefore(today, 'day');
          break;
        case "Upcoming":
          matchesTimeRange = event.startDate.isSameOrAfter(today, 'day');
          break;
        case "Today":
          matchesTimeRange = event.startDate.isSame(today, 'day');
          break;
        case "This Week":
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() - today.getDay());
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          matchesTimeRange = event.startDate.isBetween(weekStart, weekEnd, 'day', '[]');
          break;
        case "This Month":
          matchesTimeRange = event.startDate.isSame(today, 'month');
          break;
        case "This Quarter":
          const quarter = Math.floor(today.getMonth() / 3);
          const quarterStart = new Date(today.getFullYear(), quarter * 3, 1);
          const quarterEnd = new Date(today.getFullYear(), (quarter + 1) * 3, 0);
          matchesTimeRange = event.startDate.isBetween(quarterStart, quarterEnd, 'day', '[]');
          break;
        case "This Year":
          matchesTimeRange = event.startDate.isSame(today, 'year');
          break;
        default:
          matchesTimeRange = true;
      }
      
      return matchesSearch && matchesCommittee && matchesTimeRange;
    });
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
          {this.props.checkInError ? (
            <span className="CaptionSecondary error">{this.props.checkInError}</span>
          ) : (
            <span className="CaptionSecondary error">&nbsp;</span>
          )}
        </form>
      </OverlayPopup>
    );
  }

  renderCheckInFailure() {
    return (
      <OverlayPopup title={this.props.checkInError} showing={this.props.checkInSubmitted && !this.props.checkInSuccess}>
        <div className="popup-buttons">
          <Button className="popup-button popup-submit-button" style="blue" text="Try Again" onClick={this.tryAgain} />
          <Button className="popup-button popup-cancel-button" style="red" text="Cancel" onClick={this.resetCheckIn} />
        </div>
      </OverlayPopup>
    );
  }

  renderCheckInSuccess() {
    return (
      <OverlayPopup showing={this.props.checkInSubmitted && this.props.checkInSuccess}>
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
          <Button
            className="large-button popup-button popup-submit-button"
            style="green"
            text="OK!"
            onClick={this.resetCheckIn}
          />
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
    if (this.props.error) {
      return (
        <div className="events-dashboard user-dashboard">
          <h1>{this.props.error}</h1>
        </div>
      );
    }

    // Sample data for committees and time ranges
    const committees = Config.committees
    const timeRanges = ["All Time", "Past Events", "Today", "This Week", "This Month", "This Quarter", "This Year"];

    // Filter events based on search criteria
    const filteredEvents = this.filterEvents(this.props.events);

    // Group events by day
    const days = [];
    for (const event of filteredEvents) {
      if (days.length === 0 || !event.startDate.isSame(days[days.length - 1].date, 'day')) {
        days.push({ date: event.startDate, events: [event] });
      } else {
        days[days.length - 1].events.push(event);
      }
    }

    // Sort days by date (future dates first, then past dates)
    days.sort((a, b) => {
      // Sort by year (ascending)
      if (a.date.year() !== b.date.year()) {
        return a.date.year() - b.date.year();
      }
      // Then by month (ascending)
      if (a.date.month() !== b.date.month()) {
        return a.date.month() - b.date.month();
      }
      // Then by day (ascending)
      return a.date.date() - b.date.date();
    });
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    


    return (
      <div className="events-dashboard user-dashboard">
        {this.renderAttendanceForm()}
        {this.renderCheckInSuccess()}
        {this.renderCheckInFailure()}
        
        <div style={{ padding: "0 20px" }}>
          <h1 style={{ marginBottom: "20px" }}>Events</h1>
          <div style={{ marginBottom: "24px" }}>
            <EventFilterBar
              committees={committees}
              timeRanges={timeRanges}
              onSearchChange={this.handleSearchChange}
              onCommitteeChange={this.handleCommitteeChange}
              onTimeRangeChange={this.handleTimeRangeChange}
            />
          </div>
        </div>
        
        <Button
          className={`checkin-button${this.state.showCheckIn ? ' hidden' : ''}`}
          style="blue collapsible"
          icon="fa-calendar-check-o"
          text="Check In"
          onClick={this.showCheckIn}
        />
        {days.map((day, i) => (
          <EventDay day={day} key={day.date.toString()} admin={false} />
        ))}
      </div>
    );
  }
}
