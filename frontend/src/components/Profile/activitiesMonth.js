import React from "react";
import ActivitiesDay from "./activitiesDay";

export default class ActivitiesMonth extends React.Component {
  render() {
    return (
      <div className="month">
        <h2>
          {this.props.month.date.format("MMMM")} <span>{this.props.month.date.format("YYYY")}</span>
        </h2>
        {this.props.month.days.map((day, i) => (
          <ActivitiesDay key={day.date.toString()} day={day} />
        ))}
      </div>
    );
  }
}
