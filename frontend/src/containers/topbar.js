import React from 'react';
import { connect } from 'react-redux';

import { Action } from 'reducers';
import Topbar from 'components/Topbar';

class TopbarContainer extends React.Component {
  componentDidMount() {
    if (this.props.authenticated) {
      this.props.fetchUser();
    }
  }

  render() {
    const showAdminView = this.props.isAdmin && this.props.adminView;
    return <Topbar isAdmin={showAdminView} picture={this.props.picture} />;
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
      isAdmin: state.Auth.get("isAdmin"),
      isSuperAdmin: state.Auth.get("isSuperAdmin"),
      adminView: state.Auth.get("adminView"),
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
});

export default connect(mapStateToProps, mapDispatchToProps)(TopbarContainer);
