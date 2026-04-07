import React from 'react';
import { connect } from 'react-redux';
import { Action } from 'reducers';
import Topbar from 'containers/topbar';
import CareerProfile from 'components/Profile/CareerProfile';

class CareerProfileContainer extends React.Component {
  componentWillMount() {
    if (this.props.authenticated) {
      this.props.fetchUser();
    }
  }

  render() {
    return (
      <div>
        <Topbar />
        <CareerProfile 
          profile={this.props.profile} 
          updateCareerProfile={this.props.updateCareerProfile}
        />
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
  updateCareerProfile: (user) => dispatch(Action.UpdateCareerProfile(user)),
});

export default connect(mapStateToProps, mapDispatchToProps)(CareerProfileContainer);
