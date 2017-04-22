import React, { PropTypes } from 'react'
import PointsBar from './pointsBar'

class Points extends React.Component {
    render () {
        return(
            <div className="points-component">
                <span className="level-font">Level {this.props.level}</span>
                <PointsBar points={this.props.points}/>
                <span className="num-points">{this.props.points} / 100 points</span>
            </div>
        );
    }
}

export default Points;
