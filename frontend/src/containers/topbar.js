import React from "react";
import { connect } from "react-redux";

import { Action } from "reducers";
import Topbar from "components/Topbar";

class TopbarContainer extends React.Component {
  componentWillMount() {
    if (this.props.authenticated) {
      this.props.fetchUser();
    }
  }

  render() {
    return this.props.fetchSuccess ? <Topbar isAdmin={this.props.isAdmin} /> : null;
  }
}

const mapStateToProps = state => ({
  fetchSuccess: state.User.get("fetchSuccess"),
  authenticated: state.User.get("authenticated"),
  isAdmin: state.Auth.get("isAdmin"),
});

const mapDispatchToProps = dispatch => ({
  fetchUser: () => {
    dispatch(Action.FetchUser());
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(TopbarContainer);
