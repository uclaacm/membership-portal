import React from 'react';
import Config from 'config';
import Topbar from 'components/Topbar';
import Sidebar from 'containers/sidebar';
import Leaderboard from './leaderboard';

export default class LeaderboardComponent extends React.Component {
    render () {
        return(
            <div className="leaderboard">
                <Topbar />
                <Sidebar/>
                <Leaderboard leaderboard={ this.props.leaderboard } error={ this.props.error } />
            </div>
        )
    }
}
