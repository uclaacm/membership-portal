import React from 'react';
import Utils from 'utils';
import PointsBar from './pointsBar';

export default class Points extends React.Component {
  render() {
    const { currLevel, nextLevel, currLevelNumber } = Utils.getLevel(this.props.points);
    return (
      <div className="points-component">
        <div className="points-wrapper">
          <span className="Headline-2White">{currLevel.rank}</span>
          <PointsBar start={currLevel.startsAt} points={this.props.points} end={nextLevel ? nextLevel.startsAt : 0} />
          <span className="Body-2White">
Lv.
            {currLevelNumber + 1}
          </span>
          <span className="num-points Body-2White">
            {this.props.points}
            {' '}
points
          </span>
        </div>
      </div>
    );
  }
}
