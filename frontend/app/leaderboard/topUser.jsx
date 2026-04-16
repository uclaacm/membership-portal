import React from 'react';
import Utils from '@/lib/utils';

export default class TopUser extends React.Component {
  constructor() {
    super();
    this.topPlaces = ['1st', '2nd', '3rd'];
  }

  render() {
    const { currLevel } = Utils.getLevel(this.props.user.points);
    const { user, place, onChange } = this.props;
    const userPlace = this.topPlaces[place - 1];
    return (
      <div className={`top-user${place === 1 ? ' top-user-first' : ''}`}>
        <div className="rank">{userPlace}</div>
        <br />
        <img
          src={user.picture || '/assets/images/unknown.png'}
          onClick={onChange.bind(this, user.firstName, user.lastName, user.picture, user.major, user.year)}
        />
        <br />
        <div
          className="name"
          onClick={onChange.bind(this, user.firstName, user.lastName, user.picture, user.major, user.year)}
        >
          {user.firstName}
          {' '}
          {user.lastName}
        </div>
        <br />
        <div className="level">{currLevel.rank}</div>
        <br />
        <div className="points">
          {user.points}
          {' '}
          points
        </div>
      </div>
    );
  }
}
