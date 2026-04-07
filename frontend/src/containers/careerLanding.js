import React from 'react';
import { connect } from 'react-redux';
import { Action } from 'reducers';
import Topbar from 'containers/topbar';
import CareerLanding from 'components/Profile/CareerLanding';

class CareerLandingContainer extends React.Component {
  componentWillMount() {
    if (this.props.authenticated) {
      this.props.fetchUser();
    }
  }

  render() {
    return (
      <div>
        <Topbar />
        <CareerLanding profile={this.props.profile} />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  authenticated: state.Auth.get('authenticated'),
  profile: state.User.get('profile') || {},
});

const mapDispatchToProps = (dispatch) => ({
  fetchUser: () => dispatch(Action.FetchUser()),
});

export default connect(mapStateToProps, mapDispatchToProps)(CareerLandingContainer);
