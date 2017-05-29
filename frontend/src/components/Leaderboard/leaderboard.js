import React from 'react';

export default class Leaderboard extends React.Component {
    render() {
        if (this.props.error) {
            return <div className="leaderboard-wrapper"><h1>{this.props.error}</h1></div>;
        } else {
            return (
                <div className="leaderboard-wrapper">
                    <h1>Leaderboard</h1>
                </div>
            );
        }
    }
}