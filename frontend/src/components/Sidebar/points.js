import React, { PropTypes } from 'react'
import PointsBar from './pointsBar'

class Points extends React.Component {
    render () {
        return(
            <div className="points-component">
                <span className="Headline-2White">{this.props.levelClass}</span>
                <PointsBar points={this.props.points}/>
                <span className="Body-2White">Lv. {this.props.levelNumber}</span>
                <span className="num-points Body-2White">{this.props.points} / 100 points</span>
            </div>
        );
    }
}

export default Points;
