import React from 'react';
import { connect } from 'react-redux';
import { replace } from 'react-router-redux';
import PropTypes from 'prop-types';

import { Action } from 'reducers';
import ControlPanelComponent from 'components/ControlPanel';

class ControlPanel extends React.Component {
  componentWillMount() {
    const { isAdmin, isOfficer, isSuperAdmin, redirectHome } = this.props;

    if (!isAdmin && !isOfficer) {
      return redirectHome();
    }
    // when data is actually fetched
    // note: previously left out when only events were needed to be fetched for control panel
    // this led to bug where admin had to navigate to events page first to load events in control panel modal
    this.props.fetchEvents();
    this.props.fetchImages();

    if (isSuperAdmin) {
      this.props.fetchAdmins();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.isAdmin && !nextProps.isOfficer) {
      return nextProps.redirectHome();
    }

    if (nextProps.oneClickUpdated) {
      setTimeout(() => {
        this.props.updateDone();
      }, 250);
    }
  }

  render() {
    const {
      logout,
      events,
      userEmail,
      deleteEvent,
      images,
      deleteImage,
      admins,
      removeAdmin,
      addAdmin,
      reassignAdmin,
      isAdmin,
      isOfficer,
      isSuperAdmin,
      officerCommittees,
      changeOneClickPassword,
      oneClickUpdated,
      oneClickUpdateSuccess,
      oneClickError,
      eventDeleteError,
      imageDeleteError,
      adminView,
      toggleAdminView,
    } = this.props;
    return (
      <ControlPanelComponent
        isAdmin={isAdmin}
        isOfficer={isOfficer}
        logout={logout}
        userEmail={userEmail}
        events={events.reverse()}
        deleteEvent={deleteEvent}
        images={images.reverse()} // recent first
        deleteImage={deleteImage}
        admins={admins}
        removeAdmin={removeAdmin}
        reassignAdmin={reassignAdmin}
        addAdmin={addAdmin}
        isSuperAdmin={isSuperAdmin}
        officerCommittees={officerCommittees}
        changeOneClickPassword={changeOneClickPassword}
        oneClickUpdated={oneClickUpdated}
        oneClickUpdateSuccess={oneClickUpdateSuccess}
        oneClickError={oneClickError}
        eventDeleteError={eventDeleteError}
        imageDeleteError={imageDeleteError}
        adminView={adminView}
        toggleAdminView={toggleAdminView}
      />
    );
  }
}

const mapStateToProps = (state) => {
  const profile = state.User.get('profile') || {};
  return {
    userEmail: profile.email,
  authenticated: state.Auth.get('authenticated'),
  isAdmin: state.Auth.get('isAdmin'),
  isSuperAdmin: state.Auth.get('isSuperAdmin'),
  isOfficer: state.Auth.get('isOfficer'),
    officerCommittees: profile.committees || [],
  events: state.Events.get('events'),
  images: state.Images.get('images'),
    eventDeleteError: state.Events.get('deleteError'),
    imageDeleteError: state.Images.get('deleteError'),
  admins: state.Admins.get('admins'),
  oneClickUpdated: state.OneClick.get('updated'),
  oneClickUpdateSuccess: state.OneClick.get('updateSuccess'),
  oneClickError: state.OneClick.get('error'),
  adminView: state.Auth.get('adminView'),
  };
};

const mapDispatchToProps = dispatch => ({
  redirectHome: () => {
    dispatch(replace('/'));
  },

  logout: () => {
    dispatch(Action.LogoutUser());
  },

  deleteEvent: (uuid) => {
    dispatch(Action.DeleteEvent(uuid));
  },

  deleteImage: (uuid) => {
    dispatch(Action.DeleteImage(uuid));
  },

  removeAdmin: (email) => {
    dispatch(Action.DeleteAdmin(email));
  },

  reassignAdmin: (email) => {
    dispatch(Action.ChangeSuperAdmin(email));
  },

  addAdmin: (email) => {
    dispatch(Action.AddAdmin(email));
  },

  fetchEvents: () => {
    dispatch(Action.GetCurrentEvents());
  },

  fetchImages: () => {
    dispatch(Action.GetAllImages());
  },

  fetchAdmins: () => {
    dispatch(Action.FetchAdmins());
  },

  changeOneClickPassword: (oldPassword, newPassword) => {
    dispatch(Action.ChangeOneClickPassword(oldPassword, newPassword));
  },

  updateDone: () => {
    dispatch(Action.ChangeOneClickPasswordDone());
  },

  toggleAdminView: () => {
    dispatch(Action.ToggleAdminView());
  },
});

ControlPanel.propTypes = {
  isAdmin: PropTypes.bool.isRequired,
  isOfficer: PropTypes.bool.isRequired,
  redirectHome: PropTypes.func.isRequired,
  userEmail: PropTypes.string.isRequired,
  logout: PropTypes.func.isRequired,
  events: PropTypes.arrayOf(PropTypes.object).isRequired,
  images: PropTypes.arrayOf(PropTypes.object).isRequired,
  deleteEvent: PropTypes.func.isRequired,
  admins: PropTypes.arrayOf(PropTypes.object).isRequired,
  removeAdmin: PropTypes.func.isRequired,
  addAdmin: PropTypes.func.isRequired,
  reassignAdmin: PropTypes.func.isRequired,
  isAdmin: PropTypes.bool.isRequired,
  isSuperAdmin: PropTypes.bool.isRequired,
  officerCommittees: PropTypes.arrayOf(PropTypes.string).isRequired,
  changeOneClickPassword: PropTypes.func.isRequired,
  oneClickUpdated: PropTypes.bool.isRequired,
  oneClickUpdateSuccess: PropTypes.bool.isRequired,
  oneClickError: PropTypes.string.isRequired,
  eventDeleteError: PropTypes.string,
  imageDeleteError: PropTypes.string,
  adminView: PropTypes.bool.isRequired,
  toggleAdminView: PropTypes.func.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(ControlPanel);
