import React from 'react';
import Topbar from 'containers/topbar';
import Sidebar from 'containers/sidebar';
import Leaderboard from './leaderboard';

export default class LeaderboardComponent extends React.Component {
  render() {
    return (
      <div className="leaderboard">
        <Topbar />
        <Sidebar />
        <Leaderboard
          leaderboard={this.props.leaderboard}
          user={this.props.user}
          error={this.props.error}
        />
      </div>
    );
  }
}
