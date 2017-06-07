import React from 'react';
import Config from 'config';
import TopUser from './topUser';

export default class Leaderboard extends React.Component {
    constructor(props) {
        super(props)
        this.rankForUser = this.rankForUser.bind(this);
    }

    rankForUser(user) {
        let currentLevel = Config.levels[0];
        for (let level of Config.levels) {
            if (level.startsAt > user.points)
                break;
            currentLevel = level;
        }

        return currentLevel.rank;
    }

    render() {
        console.log(this.props.leaderboard, this.props.user);
        if (!this.props.leaderboard || !this.props.leaderboard.length || this.props.leaderboard.length < 3)
            return null;
        if (this.props.error) {
            return <div className="leaderboard-wrapper"><h1>{this.props.error}</h1></div>;
        } else {
            return (
                <div className="leaderboard-wrapper">
                    <div className="top-users">
                        <TopUser user={ this.props.leaderboard[1] } place={ 2 } />
                        <TopUser user={ this.props.leaderboard[0] } place={ 1 } />
                        <TopUser user={ this.props.leaderboard[2] } place={ 3 } />
                    </div>
                    <table className="leaderboard-table">
                        <thead><tr>
                            <td>#</td>
                            <td className="name">
                                <div>
                                    <img />
                                    <span>Name</span>
                                </div>
                            </td>
                            <td className="rank">Rank</td>
                            <td className="points">Points</td>
                        </tr></thead>
                        <tbody>
                        {
                            this.props.leaderboard.slice(3).map((user,i) =>  
                                <tr className={user.uuid === this.props.user.uuid ? "current-user" : ""} key={i}>
                                    <td>{i + 4}</td>
                                    <td className="name">
                                        <div>
                                            <img src={user.picture} />
                                            <span>{user.firstName} {user.lastName}</span>
                                        </div>
                                    </td>
                                    <td className="rank">{this.rankForUser(user)}</td>
                                    <td className="points">{user.points} points</td>
                                </tr>
                            )
                        }
                        </tbody>
                    </table>
                </div>
            );
        }
    }
}