import React from 'react';
import Activity from './activity';

export default class Activities extends React.Component {
  render() {
    return (
      <div className="day">
        <div className="day-label">{this.props.day.date.format('DD')}</div>
        {this.props.day.activities.map((activity, i) => (
          <Activity key={activity.uuid} activity={activity} />
        ))}
      </div>
    );
  }
}
