import React from 'react';
import TopUser from './topUser';

export default class Leaderboard extends React.Component {
    render() {
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
                            this.props.leaderboard.map((p,i) => { i > 2 && 
                                <tr className={p === 15 ? "current-user" : ""} key={i}>
                                    <td>{20-p+1}</td>
                                    <td className="name">
                                        <div>
                                            <img src="/assets/images/unknown.png" />
                                            <span>Ram Goli{Math.random() < 0.5 ? " a verylongname" : ""}</span>
                                        </div>
                                    </td>
                                    <td className="rank">Hacker</td>
                                    <td className="points">{p} points</td>
                                </tr>
                            })
                        }
                        </tbody>
                    </table>
                </div>
            );
        }
    }
}