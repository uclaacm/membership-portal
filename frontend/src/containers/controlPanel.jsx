import React from "react";
import { connect } from "react-redux";
import { replace } from "react-router-redux";
import PropTypes from "prop-types";

import { Action } from "reducers";
import ControlPanelComponent from "components/ControlPanel";

class ControlPanel extends React.Component {
  componentWillMount() {
    const { isAdmin, isSuperAdmin, redirectHome } = this.props;

    if (!isAdmin) {
      return redirectHome();
    }
    // when data is actually fetched
    // note: previously left out when only events were needed to be fetched for control panel
    // this led to bug where admin had to navigate to events page first to load events in control panel modal
    this.props.fetchEvents();

    if (isSuperAdmin) {
      this.props.fetchAdmins();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.isAdmin) {
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
      admins,
      removeAdmin,
      addAdmin,
      reassignAdmin,
      isSuperAdmin,
      changeOneClickPassword,
      oneClickUpdated,
      oneClickUpdateSuccess,
      oneClickError,
    } = this.props;
    return (
      <ControlPanelComponent
        logout={logout}
        userEmail={userEmail}
        events={events.reverse()}
        deleteEvent={deleteEvent}
        admins={admins}
        removeAdmin={removeAdmin}
        reassignAdmin={reassignAdmin}
        addAdmin={addAdmin}
        isSuperAdmin={isSuperAdmin}
        changeOneClickPassword={changeOneClickPassword}
        oneClickUpdated={oneClickUpdated}
        oneClickUpdateSuccess={oneClickUpdateSuccess}
        oneClickError={oneClickError}
      />
    );
  }
}

const mapStateToProps = state => ({
  userEmail: state.User.get("profile").email,
  authenticated: state.Auth.get("authenticated"),
  isAdmin: state.Auth.get("isAdmin"),
  isSuperAdmin: state.Auth.get("isSuperAdmin"),
  events: state.Events.get("events"),
  admins: state.Admins.get("admins"),
  oneClickUpdated: state.OneClick.get("updated"),
  oneClickUpdateSuccess: state.OneClick.get("updateSuccess"),
  oneClickError: state.OneClick.get("error"),
});

const mapDispatchToProps = dispatch => ({
  redirectHome: () => {
    dispatch(replace("/"));
  },

  logout: () => {
    dispatch(Action.LogoutUser());
  },

  deleteEvent: uuid => {
    dispatch(Action.DeleteEvent(uuid));
  },

  removeAdmin: email => {
    dispatch(Action.DeleteAdmin(email));
  },

  reassignAdmin: email => {
    dispatch(Action.ChangeSuperAdmin(email));
  },

  addAdmin: email => {
    dispatch(Action.AddAdmin(email));
  },

  fetchEvents: () => {
    dispatch(Action.GetCurrentEvents());
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
});

ControlPanel.propTypes = {
  isAdmin: PropTypes.bool.isRequired,
  redirectHome: PropTypes.func.isRequired,
  userEmail: PropTypes.string.isRequired,
  logout: PropTypes.func.isRequired,
  events: PropTypes.arrayOf(PropTypes.object).isRequired,
  deleteEvent: PropTypes.func.isRequired,
  admins: PropTypes.arrayOf(PropTypes.object).isRequired,
  removeAdmin: PropTypes.func.isRequired,
  addAdmin: PropTypes.func.isRequired,
  reassignAdmin: PropTypes.func.isRequired,
  isSuperAdmin: PropTypes.bool.isRequired,
  changeOneClickPassword: PropTypes.func.isRequired,
  oneClickUpdated: PropTypes.bool.isRequired,
  oneClickUpdateSuccess: PropTypes.bool.isRequired,
  oneClickError: PropTypes.string.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(ControlPanel);
