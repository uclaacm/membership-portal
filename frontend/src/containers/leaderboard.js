import React from 'react';
import {connect} from 'react-redux';
import { replace } from 'react-router-redux';

import {Action} from 'reducers';
import LeaderboardComponent from 'components/Leaderboard';

const REFRESH_INTERVAL = 300000; // ms to wait before allow refetching of leaderboard

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
    return <LeaderboardComponent/>;
  }
}

const mapStateToProps = (state)=>{
  return {
    leaderboard: state.Leaderboard.get('leaderboard'),
    error: state.Leaderboard.get('error'),
    fetched: state.Leaderboard.get('fetched'),
    fetchSuccess: state.Leaderboard.get('fetchSuccess'),
    fetchTime: state.Leaderboard.get('fetchTime'),
    authenticated: state.Auth.get('authenticated'),
  };
};

const mapDispatchToProps = (dispatch)=>{
  return {
    fetchLeaderboard: ()=>{
      dispatch(Action.FetchLeaderboard());
    },
  };
};


export default connect(mapStateToProps, mapDispatchToProps)(Leaderboard);