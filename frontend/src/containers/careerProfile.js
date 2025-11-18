import React from 'react';
import { connect } from 'react-redux';
import CareerProfile from 'components/Profile/CareerProfile';

class CareerProfileContainer extends React.Component {
  render() {
    return <CareerProfile profile={this.props.profile} />;
  }
}

const mapStateToProps = (state) => {
  if (state.User.get('fetchSuccess')) {
    return {
      profile: state.User.get('profile'),
    };
  }
  return {
    profile: {},
  };
};

export default connect(mapStateToProps, null)(CareerProfileContainer);
