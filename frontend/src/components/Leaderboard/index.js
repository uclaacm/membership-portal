import React, { PropTypes } from 'react';

import Config from 'config';

import Sidebar from '../Sidebar/sidebar';

class LeaderboardComponent extends React.Component {
    render () {
        return(
            <div className="leaderboard">
                <Sidebar/>
            </div>
        )
    }
}

export default LeaderboardComponent;
