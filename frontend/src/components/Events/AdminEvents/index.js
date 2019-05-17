import React from 'react';

import Button from 'components/Button';
import BannerMessage from 'components/BannerMessage';
import EarlierEventsIcon from 'components/Events/earlierEventsIcon';
import EventMonth from './eventMonth';
import AdminAddEvent from './adminAddEvent';

export default class AdminEvents extends React.Component {
  constructor(props) {
    super(props);
    this.emptyEvent = {
      attendancePoints: '',
      attendanceCode: '',
      committee: '',
      cover: '',
      description: '',
      endDate: '',
      eventLink: '',
      location: '',
      startDate: '',
      title: '',
      startTime: '',
    };

    this.state = {
      showAddEvent: false,
      isEditEvent: false,
      eventPlaceholder: this.emptyEvent,
      showEarlierEvents: false,
    };

    this.showAddEvent = this.showAddEvent.bind(this);
    this.hideAddEvent = this.hideAddEvent.bind(this);
    this.addEvent = this.addEvent.bind(this);
    this.cancelAddEventParent = this.cancelAddEventParent.bind(this);
    this.handleEditClick = this.handleEditClick.bind(this);
  }

  // Shows the add event sidebar
  showAddEvent(e) {
    this.setState(prev => ({
      showAddEvent: true,
      isEditEvent: false,
      eventPlaceholder: this.emptyEvent,
    }));
  }

  hideAddEvent(e) {
    this.setState((prev) => {
      const newState = Object.assign({}, prev);
      newState.showAddEvent = false;
      return newState;
    });
  }

  showEarlierEvents() {
    this.setState({
      showAddEvent: this.state.showAddEvent,
      isEditEvent: this.state.isEditEvent,
      eventPlaceholder: this.state.eventPlaceholder,
      showEarlierEvents: true,
    });
  }

  // Handles when update/add event
  addEvent(event) {
    // call either this.props.addEvent(event) or this.props.updateEvent(event)
    if (event.uuid) {
      this.props.updateEvent(event);
    } else {
      this.props.addEvent(event);
    }
  }

  // Handles cancel add event
  cancelAddEventParent(e) {
    this.setState(prev => ({
      showAddEvent: false,
    }));
  }

  // This function is passed down to child so when edit button is clicked, can bring up the add/edit sidebar
  handleEditClick(param) {
    this.setState(prev => ({
      showAddEvent: true,
      isEditEvent: true,
      eventPlaceholder: param,
    }));
  }

  componentWillReceiveProps(nextProps) {
    if ((nextProps.updated && nextProps.updateSuccess) || (nextProps.created && nextProps.createSuccess)) {
      this.setState(prev => ({
        showAddEvent: false,
        isEditEvent: false,
      }));
    }
  }

  render() {
    const events = this.props.events;
    const months = [];
    let i = 0;

    while (i < events.length) {
      const month = { date: events[i].startDate, days: [] };
      while (i < events.length && events[i].startDate.month() === month.date.month()) {
        if (month.days.length === 0 || events[i].startDate.date() !== month.days[month.days.length - 1].date.date()) month.days.push({ date: events[i].startDate, events: [events[i]] });
        else month.days[month.days.length - 1].events.push(events[i]);
        i++;
      }
      months.push(month);
    }

    const thisMonth = new Date();
    thisMonth.setHours(0, 0, 0, 0);
    thisMonth.setDate(1);
    const pastMonths = months.filter(month => month.date < thisMonth);
    const futureMonths = months.filter(month => month.date >= thisMonth);

    const bannerMessage = (this.props.updateSuccess) ? 'Event updated successfully'
      : (this.props.createSuccess) ? 'Event created successfully'
        : this.props.error;

    return (
      <div className="events-dashboard admin-dashboard">
        <BannerMessage
          showing={this.props.updated || this.props.created}
          success={this.props.updateSuccess || this.props.createSuccess}
          message={bannerMessage}
        />
        <AdminAddEvent
          event={this.state.eventPlaceholder}
          onClickAdd={this.addEvent}
          onClickCancel={this.cancelAddEventParent}
          isEdit={this.state.isEditEvent}
          showing={this.state.showAddEvent}
        />

        {!this.state.showAddEvent && (
        <Button
          className="checkin-button"
          style="blue collapsible"
          icon="fa-plus"
          text="Add Event"
          onClick={this.showAddEvent}
        />
        )}

        { !this.state.showEarlierEvents && <EarlierEventsIcon onClick={() => { this.showEarlierEvents(); }} /> }
        { this.state.showEarlierEvents && pastMonths.map((month, i) => <EventMonth month={month} key={month.date.toString()} handleEditClick={this.handleEditClick} />) }

        { futureMonths.map((month, i) => <EventMonth month={month} key={month.date.toString()} handleEditClick={this.handleEditClick} />) }
      </div>
    );
  }
}
