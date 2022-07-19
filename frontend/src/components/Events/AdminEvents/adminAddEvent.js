import React from "react";
import moment from "moment";

import InputElement from "react-input-mask";
import DatePicker from "react-datepicker";
import Button from "components/Button/index";

import "react-datepicker/dist/react-datepicker.css";

export default class AdminAddEvent extends React.Component {
  constructor(props) {
    super(props);
    this.state = { event: this.props.event, startTimeError: false, endTimeError: false };
    this.resizeTextArea = this.resizeTextArea.bind(this);
    this.handleChangeStartDate = this.handleChangeStartDate.bind(this);
    this.handleChangeEndDate = this.handleChangeEndDate.bind(this);
    this.handleChangeTime = this.handleChangeTime.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  resizeTextArea(e) {
    e.target.style.height = "5px";
    e.target.style.height = `${e.target.scrollHeight}px`;
  }

  handleChangeStartDate(date) {
    this.setState(prev => {
      const newState = Object.assign({}, prev);
      newState.event.startDate = date;
      return newState;
    });
  }

  handleChangeEndDate(date) {
    this.setState(prev => {
      const newState = Object.assign({}, prev);
      newState.event.endDate = date;
      return newState;
    });
  }

  handleChange(e) {
    const name = e.target.name;
    const value = e.target.value;
    this.setState(prev => {
      const newState = Object.assign({}, prev);
      newState.event[name] = value;
      return newState;
    });
  }

  handleSubmit() {
    if (this.state.endTimeError || this.state.startTimeError) return;
    if (this.props.onClickAdd) this.props.onClickAdd(this.state.event);
  }

  handleChangeTime(e) {
    const name = e.target.name.split("Time")[0];
    const hh = (parseInt(e.target.value[0]) || 0) * 10 + (parseInt(e.target.value[1]) || 0);
    const mm = (parseInt(e.target.value[3]) || 0) * 10 + (parseInt(e.target.value[4]) || 0);
    this.setState(prev => {
      const newState = Object.assign({}, prev);
      newState[`${name}TimeError`] = isNaN(hh) || hh > 23 || isNaN(mm) || mm > 60;
      if (!newState[`${name}TimeError`]) {
        if (newState.event[`${name}Date`]) newState.event[`${name}Date`].set({ hour: hh, minute: mm });
        else {
          newState.event[`${name}Date`] = moment({ hour: hh, minute: mm });
        }
      }
      return newState;
    });
  }

  componentWillReceiveProps(nextProps) {
    this.setState(prev => {
      const newState = Object.assign({}, prev);
      newState.event = nextProps.event;
      if (newState.event) newState.event.attendanceCode = nextProps.event.attendanceCode || "";
      return newState;
    });
  }

  render() {
    return (
      <div className={`add-event-overlay${this.props.showing ? " showing" : ""}`} onClick={this.props.onClickCancel}>
        <div className="event-sidebar" onClick={e => e.stopPropagation()}>
          <div className="cover-img">
            <img
              src={this.state.event.cover}
              id="event-cover-img"
            />
          </div>
          <div className="editor">
            <div className="input-row">
              <div className="input-field half-width">
                <p>Image URL</p>
                <input type="text" value={this.state.event.cover} name="cover" onChange={this.handleChange} />
              </div>
              <div className="input-field half-width">
                <p>Event URL</p>
                <input type="text" value={this.state.event.eventLink} name="eventLink" onChange={this.handleChange} />
              </div>
            </div>
            <div className="input-row">
              <div className="input-field">
                <p>Event Title</p>
                <input type="text" value={this.state.event.title} name="title" onChange={this.handleChange} />
              </div>
            </div>
            <div className="input-row">
              <div className="input-field">
                <p>Committee</p>
                <input type="text" value={this.state.event.committee} name="committee" onChange={this.handleChange} />
              </div>
            </div>
            <div className="input-row">
              <div className="input-field half-width">
                <p>Attendance Code</p>
                <input
                  type="text"
                  value={this.state.event.attendanceCode}
                  name="attendanceCode"
                  onChange={this.handleChange}
                />
              </div>
              <div className="input-field half-width">
                <p>Attendance Points</p>
                <input
                  type="text"
                  value={this.state.event.attendancePoints}
                  name="attendancePoints"
                  onChange={this.handleChange}
                />
              </div>
            </div>
            <div className="divider" />
            <div className="input-row">
              <div className="input-field three-fourth-width">
                <p>Start Date</p>
                <DatePicker
                  selected={this.state.event.startDate}
                  onChange={this.handleChangeStartDate}
                  className="date-picker"
                />
              </div>
              <div className="input-field three-fourth-width">
                <p>Start Time</p>
                <InputElement
                  className={this.state.startTimeError ? "error" : ""}
                  onChange={this.handleChangeTime}
                  mask="99:99"
                  name="startTime"
                  value={this.state.event.startDate ? this.state.event.startDate.format("HH:mm") : ""}
                />
              </div>
            </div>
            <div className="input-row">
              <div className="input-field three-fourth-width">
                <p>End Date</p>
                <DatePicker
                  selected={this.state.event.endDate}
                  onChange={this.handleChangeEndDate}
                  className="date-picker"
                />
              </div>
              <div className="input-field three-fourth-width">
                <p>End Time</p>
                <InputElement
                  className={this.state.endTimeError ? "error" : ""}
                  onChange={this.handleChangeTime}
                  mask="99:99"
                  name="endTime"
                  value={this.state.event.endDate ? this.state.event.endDate.format("HH:mm") : ""}
                />
              </div>
            </div>
            <div className="input-row">
              <div className="input-field">
                <p>Event Location</p>
                <input type="text" value={this.state.event.location} name="location" onChange={this.handleChange} />
              </div>
            </div>
            <div className="input-row">
              <div className="input-field">
                <p>Event Description</p>
                <textarea
                  value={this.state.event.description}
                  name="description"
                  onChange={this.handleChange}
                  onKeyUp={this.resizeTextArea}
                />
              </div>
            </div>
            <div className="button-area">
              <Button onClick={this.handleSubmit} style="green" text={this.props.isEdit ? "Update" : "Add"} icon="" />
              <Button onClick={this.props.onClickCancel} style="red" text="Cancel" icon="" />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
