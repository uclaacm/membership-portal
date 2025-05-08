import React from "react";
import { connect } from "react-redux";
import { replace } from "react-router-redux";

import { Action } from "reducers";
import ProfileComponent from "components/Profile";

class Profile extends React.Component {
  constructor(props) {
    super(props);
  }

  saveChanges(newprofile) {
    this.props.updateUser(newprofile);
  }

  componentWillMount() {
    // Only redirect if admin is in admin view
    const showAdminView = this.props.isAdmin && this.props.adminView;
    if (showAdminView) {
      return this.props.redirectHome();
    }
    if (this.props.authenticated) {
      this.props.fetchUser();
      this.props.fetchActivity();
    }
  }

  componentWillReceiveProps(nextProps) {
    // Only redirect if admin is in admin view
    const showAdminView = nextProps.isAdmin && nextProps.adminView;
    if (showAdminView) {
      return nextProps.redirectHome();
    }
    if (nextProps.updated) {
      setTimeout(() => {
        this.props.updateDone();
      }, 1000);
    }
  }

  render() {
    return (
      <ProfileComponent
        profile={this.props.profile}
        updated={this.props.updated}
        updateSuccess={this.props.updateSuccess}
        updateError={this.props.updateError}
        saveChanges={this.saveChanges.bind(this)}
        logout={this.props.logout}
        activity={this.props.activity}
        activityError={this.props.activityError}
        adminView={this.props.adminView}
        toggleAdminView={this.props.toggleAdminView}
        isAdmin={this.props.isAdmin}
      />
    );
  }
}

const mapStateToProps = state => {
  const profile = {
    name: "",
    major: "",
    year: 0,
    points: 0,
  };

  if (state.User.get("fetchSuccess")) {
    const User = state.User.get("profile");
    profile.name = `${User.firstName} ${User.lastName}`;
    profile.major = User.major;
    profile.year = User.year;
    profile.points = User.points;
  }

  return {
    profile,
    activity: state.User.get("activity"),
    fetchSuccess: state.User.get("fetchSuccess"),
    updated: state.User.get("updated"),
    updateSuccess: state.User.get("updateSuccess"),
    updateError: state.User.get("error"),
    authenticated: state.Auth.get("authenticated"),
    isAdmin: state.Auth.get("isAdmin"),
    adminView: state.Auth.get("adminView"),
    activityError: state.User.get("activityError"),
  };
};

const mapDispatchToProps = dispatch => ({
  fetchUser: () => {
    dispatch(Action.FetchUser());
  },
  updateUser: newprofile => {
    dispatch(Action.UpdateUser(newprofile));
  },
  redirectHome: () => {
    dispatch(replace("/"));
  },
  updateDone: () => {
    dispatch(Action.UserUpdateDone());
  },
  logout: () => {
    dispatch(Action.LogoutUser());
  },
  fetchActivity: () => {
    dispatch(Action.FetchActivity());
  },
  toggleAdminView: () => {
    dispatch(Action.ToggleAdminView());
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(Profile);
