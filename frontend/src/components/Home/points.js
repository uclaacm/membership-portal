import React from 'react';
import Utils from 'utils';
import PointsBar from './pointsBar';

export default class Points extends React.Component {
  render() {
    const { currLevel, nextLevel, currLevelNumber } = Utils.getLevel(this.props.points);
    return (
      <div className="points-component">
        <div className="points-wrapper">
          <span className="Body-2Black">Level {currLevelNumber + 1}: <b>{currLevel.rank}</b></span>
          <span className="num-points Body-2Black">
            {this.props.points}
            {' '}
            points
          </span>
          <PointsBar start={currLevel.startsAt} points={this.props.points} end={nextLevel ? nextLevel.startsAt : 0} />
          <span className="Body-3Black">
            Earn <b>{ nextLevel ? nextLevel.startsAt - this.props.points : 0 }</b> more points to reach <b>{ nextLevel ? nextLevel.rank : 'MAX' }</b>!
          </span>

        </div>
      </div>
    );
  }
}
