import React from 'react';
import { connect } from 'react-redux';

import { Action } from 'reducers';
import Topbar from 'containers/topbar';
import Sidebar from 'containers/sidebar';
import UserEvents from 'components/Events/UserEvents';
import AdminEvents from 'components/Events/AdminEvents';

class Events extends React.Component {
  componentWillMount() {
    if (this.props.authenticated) {
      this.props.fetchEvents();
      this.props.fetchImages();
      this.props.fetchUserRSVPs();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.eventUpdated || nextProps.eventCreated || nextProps.eventsSynced) {
      setTimeout(() => {
        this.props.updateDone();
        this.props.createDone();
        this.props.syncDone();
      }, 250);
    }
  }

  render() {
    // Only show admin view if user is admin AND adminView is true
    const showAdminView = this.props.isAdmin && this.props.adminView;

    return (
      <div>
        <Topbar />
        {/* <Sidebar /> */}
        {!showAdminView ? (
          <UserEvents
            events={this.props.events}
            checkIn={this.props.checkIn}
            error={this.props.error}
            checkInSubmitted={this.props.checkInSubmitted}
            checkInSuccess={this.props.checkInSuccess}
            checkInError={this.props.checkInError}
            checkInPoints={this.props.checkInPoints}
            resetCheckIn={this.props.resetCheckIn}
            userRsvps={this.props.userRsvps}
            rsvpError={this.props.rsvpError}
            createRSVP={this.props.createRSVP}
            cancelRSVP={this.props.cancelRSVP}
          />
        ) : (
          <AdminEvents
            events={this.props.events}
            error={this.props.error}
            createEvent={this.props.createEvent}
            created={this.props.eventCreated}
            createSuccess={this.props.eventCreateSuccess}
            updated={this.props.eventUpdated}
            updateSuccess={this.props.eventUpdateSuccess}
            synced={this.props.eventsSynced}
            syncSuccess={this.props.eventsSyncSuccess}
            syncMessage={this.props.syncMessage}
            addEvent={this.props.addEvent}
            updateEvent={this.props.updateEvent}
            syncEvents={this.props.syncEvents}
            fetchEventRSVPs={this.props.fetchEventRSVPs}
            rsvpError={this.props.rsvpError}
            createImage={this.props.createImage}
            imageCreateSuccess={this.props.imageCreateSuccess}
            imageCreateUuid={this.props.imageCreateUuid}
          />
        )}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  events: state.Events.get('events'),
  error: state.Events.get('error'),
  eventCreated: state.Events.get('posted'),
  eventCreateSuccess: state.Events.get('postSuccess'),
  eventUpdated: state.Events.get('updated'),
  eventUpdateSuccess: state.Events.get('updateSuccess'),
  eventsSynced: state.Events.get('synced'),
  eventsSyncSuccess: state.Events.get('syncSuccess'),
  syncMessage: state.Events.get('syncMessage'),
  authenticated: state.Auth.get('authenticated'),
  isAdmin: state.Auth.get('isAdmin'),
  adminView: state.Auth.get('adminView'),
  checkInSubmitted: state.CheckIn.get('submitted'),
  checkInPoints: state.CheckIn.get('numPoints'),
  checkInSuccess: state.CheckIn.get('success'),
  checkInError: state.CheckIn.get('error'),
  userRsvps: state.RSVP.get('userRsvps'),
  rsvpError: state.RSVP.get('error'),
  imageCreated: state.Images.get('created'),
  imageCreateSuccess: state.Images.get('createSuccess'),
  imageCreateUuid: state.Images.get('createUuid'),
});

const mapDispatchToProps = dispatch => ({
  fetchEvents: () => {
    dispatch(Action.GetCurrentEvents());
  },

  fetchImages: () => {
    dispatch(Action.GetAllImages());
  },

  checkIn: (id) => {
    dispatch(Action.CheckInto(id));
  },

  resetCheckIn: () => {
    dispatch(Action.ResetCheckIn());
  },

  addEvent: (event) => {
    dispatch(Action.PostNewEvent(event));
  },

  updateEvent: (event) => {
    dispatch(Action.UpdateEvent(event));
  },

  updateDone: () => {
    dispatch(Action.UpdateEventDone());
  },

  createDone: () => {
    dispatch(Action.CreateEventDone());
  },

  syncEvents: () => {
    dispatch(Action.SyncEventsFromSheets());
  },

  syncDone: () => {
    dispatch(Action.SyncEventsDone());
  },

  fetchUserRSVPs: () => {
    dispatch(Action.FetchUserRSVPs());
  },

  createRSVP: (eventUuid) => {
    dispatch(Action.CreateRSVP(eventUuid));
  },

  cancelRSVP: (eventUuid) => {
    dispatch(Action.CancelRSVP(eventUuid));
  },

  fetchEventRSVPs: (eventUuid) => {
    dispatch(Action.FetchEventRSVPs(eventUuid));
  },

  createImage: (formData) => {
    dispatch(Action.CreateImage(formData));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(Events);
