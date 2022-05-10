import React from "react";
import PropTypes from "prop-types";

import EventDay from "./eventDay";

export default class EventMonth extends React.Component {
  render() {
    const { month, handleEditClick } = this.props;
    return (
      <div className="event-month">
        <h1 className="Display-2Primary date-month">Events in {month.date.format("MMMM")}</h1>
        {month.days.map((day, i) => (
          <EventDay key={day.date.toString()} day={day} handleEditClick={handleEditClick} />
        ))}
      </div>
    );
  }
}

EventMonth.propTypes = {
  month: PropTypes.shape({
    date: PropTypes.object,
    days: PropTypes.array,
  }).isRequired,
  handleEditClick: PropTypes.func.isRequired,
};
