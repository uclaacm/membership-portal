import React from 'react'
import Config from 'config'
import PointsBar from './pointsBar'

export default class Points extends React.Component {
    render () {
        let currLevel = null;
        let nextLevel = null;
        let currLevelNumber = 0;
        for (let i = 0; i < Config.levels.length; i++) {
            if (Config.levels[i].startsAt > this.props.points) {
                currLevel = Config.levels[i - 1];
                currLevelNumber = i - 1;
                nextLevel = Config.levels[i];
                break;
            }
        }

        return (
            <div className="points-component">
                <div className="points-wrapper">
                    <span className="Headline-2White">{currLevel.rank}</span>
                    <PointsBar start={currLevel.startsAt} points={this.props.points} end={nextLevel ? nextLevel.startsAt : 0} />
                    <span className="Body-2White">Lv. {currLevelNumber+1}</span>
                    <span className="num-points Body-2White">{this.props.points} points</span>
                </div>
            </div>
        );
    }
}