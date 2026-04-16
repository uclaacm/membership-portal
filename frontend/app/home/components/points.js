import React from 'react';
import Config from '@/lib/config';
import PointsBar from './pointsBar';

const getLevel = (points) => {
  let i = 1;
  while (i < Config.levels.length && points > Config.levels[i].startsAt) {
    i += 1;
  }
  const currLevel = Config.levels[i - 1];
  const nextLevel = i === Config.levels.length ? null : Config.levels[i];
  const currLevelNumber = i - 1;
  return { currLevel, nextLevel, currLevelNumber };
};

export default class Points extends React.Component {
  render() {
    const { currLevel, nextLevel, currLevelNumber } = getLevel(this.props.points);
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
