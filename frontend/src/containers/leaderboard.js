import React from 'react';
import {connect} from 'react-redux';
import {Action} from 'reducers';
import LeaderboardComponent from 'components/Leaderboard';

import { replace } from 'react-router-redux';

const min5 = 300000;

class Leaderboard extends React.Component {
  componentWillMount() {
    if(this.props.authenticated && (Date.now() - this.props.fetchTime) > min5){
      this.props.fetchLeaderboard();
    }
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.authenticated && (Date.now() - nextProps.fetchTime) > min5){
      this.props.fetchLeaderboard();
    }
  }

  render() {
    return <div>
      <LeaderboardComponent/>
    </div>;
  }
}

const mapStateToProps = (state)=>{
  return {
    'authenticated': state.Auth.get('authenticated'),
    'leaderboard': state.Leaderboard.get('leaderboard'),
    'error': state.Leaderboard.get('error'),
    'fetched': state.Leaderboard.get('fetched'),
    'fetchSuccess': state.Leaderboard.get('fetchSuccess'),
    'fetchTime': state.Leaderboard.get('fetchTime'),
  };
};

const mapDispatchToProps = (dispatch)=>{
  return {
    fetchLeaderboard: ()=>{
      dispatch(Action.FetchLeaderboard());
    },
  };
};


Leaderboard = connect(mapStateToProps, mapDispatchToProps)(Leaderboard);
export default Leaderboard
