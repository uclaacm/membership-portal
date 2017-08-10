import React from 'react';

export default class TopUser extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const { currLevel } = Utils.getLevel(this.props.user.points);
        return (
            <div className={"top-user" + (this.props.place === 1 ? " top-user-first" : "")}>
                <div className="rank">{ ["1st", "2nd", "3rd"][this.props.place-1] }</div><br />
                <img src={this.props.user.picture || "/assets/images/unknown.png"}/><br />
                <div className="name">{this.props.user.firstName} {this.props.user.lastName}</div><br />
                <div className="level">{currLevel.rank}</div><br />
                <div className="points">{this.props.user.points} points</div>
            </div>
        );
    }
}