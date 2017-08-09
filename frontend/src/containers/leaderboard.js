import React from 'react';
import {connect} from 'react-redux';

import {Action} from 'reducers';
import LeaderboardComponent from 'components/Leaderboard';

// ms to wait before allow refetching of leaderboard
const REFRESH_INTERVAL = 30000;

class Leaderboard extends React.Component {
  componentWillMount() {
    if(this.props.authenticated && (Date.now() - this.props.fetchTime) > REFRESH_INTERVAL){
      this.props.fetchLeaderboard();
    }
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.authenticated && (Date.now() - nextProps.fetchTime) > REFRESH_INTERVAL){
      this.props.fetchLeaderboard();
    }
  }

  render() {
    return <LeaderboardComponent leaderboard={this.props.leaderboard}
                                 user={this.props.user} />;
  }
}

const mapStateToProps = (state)=>{
  return {
    leaderboard: state.Leaderboard.get('leaderboard'),
    fetchTime: state.Leaderboard.get('fetchTime'),
    authenticated: state.Auth.get('authenticated'),
    user: state.User.get('profile')
  };
};

const mapDispatchToProps = (dispatch)=>{
  return {
    fetchLeaderboard: () => {
      dispatch(Action.FetchLeaderboard());
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Leaderboard);