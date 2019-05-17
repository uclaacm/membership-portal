import React from 'react';
import { connect } from 'react-redux';

import { Action } from 'reducers';
import Sidebar from 'components/Sidebar';

class SidebarContainer extends React.Component {
  componentWillMount() {
    if (this.props.authenticated) {
      this.props.fetchUser();
    }
  }

  render() {
    return this.props.fetchSuccess
						 ? (
  <Sidebar
    isAdmin={this.props.isAdmin}
    picture={this.props.picture}
    username={this.props.username}
    points={this.props.points}
    logout={this.props.logout}
  />
      ) : null;
  }
}

const mapStateToProps = (state) => {
  if (state.User.get('fetchSuccess')) {
    const profile = state.User.get('profile');
    return {
      fetchSuccess: true,
      authenticated: true,
      picture: profile.picture,
      username: `${profile.firstName} ${profile.lastName}`,
      points: profile.points,
      isAdmin: state.Auth.get('isAdmin'),
    };
  }
  return {
    fetchSuccess: false,
    authenticated: state.Auth.get('authenticated'),
  };
};

const mapDispatchToProps = dispatch => ({
  fetchUser: () => {
    dispatch(Action.FetchUser());
  },

  logout: () => {
    dispatch(Action.LogoutUser());
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(SidebarContainer);
