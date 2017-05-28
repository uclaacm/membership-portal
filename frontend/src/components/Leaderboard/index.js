import React from 'react';
import Config from 'config';
import Topbar from '../Topbar';
import Sidebar from '../Sidebar';

export default class LeaderboardComponent extends React.Component {
    render () {
        return(
            <div className="leaderboard">
                <Topbar />
                <Sidebar/>
            </div>
        )
    }
}