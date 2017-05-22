import React from 'react';
import {connect} from 'react-redux';
import {Action} from 'reducers';
import LeaderboardComponent from 'components/Leaderboard';

import { replace } from 'react-router-redux';


class Leaderboard extends React.Component {

    render() {
        return(
            <div>
                <LeaderboardComponent/>
            </div>
        )
    }
}

const mapStateToProps = (state)=>{
    const A = state.Auth;
    return {

    };
};

const mapDispatchToProps = (dispatch)=>{
  return {

  };
};


Leaderboard = connect(mapStateToProps, mapDispatchToProps)(Leaderboard);
export default Leaderboard
