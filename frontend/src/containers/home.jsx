import React from 'react';
import { connect } from 'react-redux';

import { Action } from 'reducers';
import Topbar from 'containers/topbar';
import HomeComponent from 'components/Home/home';
import PropTypes from 'prop-types';

const REFRESH_INTERVAL = 30000;

class Home extends React.Component {
  componentWillMount() {
    const {
      authenticated,
      fetchEvents,
      fetchUser,
      fetchTime,
      fetchLeaderboard,
    } = this.props;

    if (!authenticated) return;

    fetchEvents();
    fetchUser();
    if (Date.now() - fetchTime > REFRESH_INTERVAL) {
      fetchLeaderboard();
    }
  }

  componentWillReceiveProps(nextProps) {
    const { updateDone, createDone, fetchLeaderboard } = this.props;
    const {
      eventUpdated, eventCreated, authenticated, fetchTime,
    } = nextProps;

    if (eventUpdated || eventCreated) {
      setTimeout(() => {
        updateDone();
        createDone();
      }, 250);
    }

    if (authenticated && Date.now() - fetchTime > REFRESH_INTERVAL) {
      fetchLeaderboard();
    }
  }

  render() {
    const {
      checkIn,
      checkInPoints,
      checkInSuccess,
      checkInError,
      isAdmin,
      isSuperAdmin,
      adminView,
      picture,
      username,
      points,
      leaderboard,
    } = this.props;

    return (
      <div>
        <Topbar />
        <HomeComponent
          isAdmin={isAdmin}
          isSuperAdmin={isSuperAdmin}
          adminView={adminView}
          picture={picture}
          username={username}
          checkIn={checkIn}
          checkInPoints={checkInPoints}
          checkInSuccess={checkInSuccess}
          checkInError={checkInError}
          points={points}
          leaderboard={leaderboard}
        />
      </div>
    );
  }
}

Home.propTypes = {
  eventCreated: PropTypes.bool.isRequired,
  eventUpdated: PropTypes.bool.isRequired,
  authenticated: PropTypes.bool.isRequired,
  isAdmin: PropTypes.bool.isRequired,
  isSuperAdmin: PropTypes.bool.isRequired,
  adminView: PropTypes.bool.isRequired,
  picture: PropTypes.string.isRequired,
  username: PropTypes.string.isRequired,
  checkInPoints: PropTypes.number.isRequired,
  checkInSuccess: PropTypes.bool.isRequired,
  checkInError: PropTypes.string.isRequired,
  points: PropTypes.number.isRequired,
  leaderboard: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      firstName: PropTypes.string.isRequired,
      lastName: PropTypes.string.isRequired,
      points: PropTypes.number.isRequired,
    }).isRequired,
  ).isRequired,
  fetchTime: PropTypes.number.isRequired,
  fetchEvents: PropTypes.func.isRequired,
  fetchUser: PropTypes.func.isRequired,
  checkIn: PropTypes.func.isRequired,
  updateDone: PropTypes.func.isRequired,
  createDone: PropTypes.func.isRequired,
  fetchLeaderboard: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => {
  const userFetchSuccess = state.User.get('fetchSuccess');
  const profile = userFetchSuccess ? state.User.get('profile') : {};
  return {
    events: state.Events.get('events'),
    error: state.Events.get('error'),
    eventCreated: state.Events.get('posted'),
    eventCreateSuccess: state.Events.get('postSuccess'),
    eventUpdated: state.Events.get('updated'),
    eventUpdateSuccess: state.Events.get('updateSuccess'),
    authenticated: state.Auth.get('authenticated'),
    isAdmin: state.Auth.get('isAdmin'),
    isSuperAdmin: state.Auth.get('isSuperAdmin'),
    adminView: state.Auth.get('adminView'),
    picture: userFetchSuccess ? profile.picture : '',
    username: userFetchSuccess ? `${profile.firstName} ${profile.lastName}` : '',
    checkInSubmitted: state.CheckIn.get('submitted'),
    checkInPoints: state.CheckIn.get('numPoints'),
    checkInSuccess: state.CheckIn.get('success'),
    checkInError: state.CheckIn.get('error'),
    points: profile.points,
    leaderboard: state.Leaderboard.get('leaderboard'),
    fetchTime: state.Leaderboard.get('fetchTime'),
  };
};

const mapDispatchToProps = dispatch => ({
  fetchEvents: () => dispatch(Action.GetCurrentEvents()),
  fetchUser: () => dispatch(Action.FetchUser()),
  checkIn: id => dispatch(Action.CheckInto(id)),
  resetCheckIn: () => dispatch(Action.ResetCheckIn()),
  addEvent: event => dispatch(Action.PostNewEvent(event)),
  updateEvent: event => dispatch(Action.UpdateEvent(event)),
  updateDone: () => dispatch(Action.UpdateEventDone()),
  createDone: () => dispatch(Action.CreateEventDone()),
  fetchLeaderboard: () => dispatch(Action.FetchLeaderboard()),
});

export default connect(mapStateToProps, mapDispatchToProps)(Home);
