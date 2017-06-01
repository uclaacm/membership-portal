import React from 'react';

export default class Leaderboard extends React.Component {
    render() {
        if (this.props.error) {
            return <div className="leaderboard-wrapper"><h1>{this.props.error}</h1></div>;
        } else {
            return (
                <div className="leaderboard-wrapper">
                    <div className="top-users">
                        <div className="top-user">
                            <div className="rank">2nd</div><br />
                            <img src="/assets/images/unknown.png "/><br />
                            <div className="name">Ram Goli</div><br />
                            <div className="level">Hacker</div><br />
                            <div className="points">1337 points</div>
                        </div>
                        <div className="top-user top-user-first">
                            <div className="rank">1st</div><br />
                            <img src="/assets/images/unknown.png "/><br />
                            <div className="name">Ram Goli a verylongname</div><br />
                            <div className="level">Hacker</div><br />
                            <div className="points">1337 points</div>
                        </div>
                        <div className="top-user">
                            <div className="rank">3rd</div><br />
                            <img src="/assets/images/unknown.png "/><br />
                            <div className="name">Ram Goli</div><br />
                            <div className="level">Hacker</div><br />
                            <div className="points">1337 points</div>
                        </div>
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
                        {
                            [20,19,18,17,16,15,14,13,12,11,10,9,8,7,6,5,4,3,2,1].map(p => 
                                <tr className={p === 15 ? "current-user" : ""}>
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
                            )
                        }
                    </table>
                </div>
            );
        }
    }
}