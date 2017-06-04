import React from 'react'
import moment from 'moment';

import InputElement from 'react-input-mask';
import DatePicker from 'react-datepicker'
import Button from 'components/Button/index'

import 'react-datepicker/dist/react-datepicker.css';

export default class AdminAddEvent extends React.Component {
    constructor(props) {
        super(props)
        this.state = { event: this.props.event };
        this.handleChangeStartDate = this.handleChangeStartDate.bind(this);
        this.handleChangeEndDate = this.handleChangeEndDate.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.resizeTextArea = this.resizeTextArea.bind(this);
    }

    handleChangeStartDate(date) {
        this.setState(prev => {
            let newState = Object.assign({}, prev);
            newState.event.startDate = date;
            return newState;
        });
    }

    handleChangeEndDate(date) {
        this.setState(prev => {
            let newState = Object.assign({}, prev);
            newState.event.endDate = date;
            return newState;
        });
    }

    handleChange(e) {
        let name = e.target.name;
        let value = e.target.value;
        this.setState(prev => {
            let newState = Object.assign({}, prev);
            newState.event[name] = value;
            return newState;
        });
    }

    resizeTextArea(e) {
        e.target.style.height = "5px";
        e.target.style.height = (e.target.scrollHeight) + "px";
    }

    componentWillReceiveProps(nextProps) {
        this.setState(prev => {
            let newState = Object.assign({}, prev);
            newState.event = nextProps.event;
            return newState;
        });
    }

    render() {
        const event = this.props.event;

        const timeMask = "99:99";
        const dateMask = "99-99-99";

        const startDate = event.startDate ? (event.startDate.format("MM-D-YY")) : "";
        const endDate = event.endDate ? (event.endDate.format("MM-D-YY")) : "";

        const startTime = event.startDate ? (event.startDate.format("HH:mm")) : "";
        const endTime = event.endDate ? (event.endDate.format("h:mm a")) : "";

        const format = 'h:mm a';
        const now = moment().hour(0).minute(0);

        return (
            <div className={"add-event-overlay" + (this.props.showing ? " showing" : "")} onClick={this.props.onClickCancel}>
                <div className="event-sidebar" onClick={e => e.stopPropagation() }>
                    <div className="cover-img">
                        <img src={this.state.event.cover} />
                    </div>
                    <div className="editor">
                        <div className="input-row">
                            <div className="input-field half-width">
                                <p>Image URL</p>
                                <input type="text" value={this.state.event.cover} name="cover" onChange={this.handleChange} />
                            </div>
                            <div className="input-field half-width">
                                <p>Event URL</p>
                                <input type="text" value={this.state.event.eventLink} name="eventLink" onChange={this.handleChange}  />
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
                                <input type="text" value={this.state.event.attendanceCode} name="attendanceCode" onChange={this.handleChange} />
                            </div>
                            <div className="input-field half-width">
                                <p>Attendance Points</p>
                                <input type="text" value={this.state.event.attendancePoints} name="attendancePoints" onChange={this.handleChange} />
                            </div>
                        </div>
                        <div className="divider"></div>
                        <div className="input-row">
                            <div className="input-field half-width">
                                <p>Start Date</p>
                                <DatePicker
                                    selected={this.state.event.startDate}
                                    onChange={this.handleChangeStartDate}
                                    className="date-picker" />
                            </div>
                            <div className="input-field one-fourth-width">
                                <p>Start Time</p>
                                <InputElement
                                    placeholder="hh:mm"
                                    mask={timeMask}
                                    defaultValue={this.state.event.startDate && this.state.event.startDate.format("a")} />
                            </div>
                            <div className="input-field one-fourth-width">
                                <select defaultValue="">
                                    <option value="" disabled>--</option>
                                    <option value="am">AM</option>
                                    <option value="pm">PM</option>
                                </select>
                            </div>
                        </div>
                        <div className="input-row">
                            <div className="input-field half-width">
                                <p>End Date</p>
                                <DatePicker
                                    selected={this.state.event.endDate}
                                    onChange={this.handleChangeEndDate}
                                    className="date-picker" />
                            </div>
                            <div className="input-field one-fourth-width">
                                <p>End Time</p>
                                <InputElement
                                    placeholder="hh:mm"
                                    mask={timeMask}
                                    defaultValue={this.state.event.endDate && this.state.event.endDate.format("a")} />
                            </div>
                            <div className="input-field one-fourth-width">
                                <select defaultValue="">
                                    <option value="" disabled>--</option>
                                    <option value="am">AM</option>
                                    <option value="pm">PM</option>
                                </select>
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
                                <textarea value={this.state.event.description} name="description" onChange={this.handleChange} onKeyUp={this.resizeTextArea}></textarea>
                            </div>
                        </div>
                        <div className="button-area">
                            <Button onClick={this.props.onClickAdd} style="green" text={this.props.isEdit ? "Update" : "Add"} icon="" />

                            <Button onClick={this.props.onClickCancel} style="red" text="Cancel" icon="" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

/**
 * 
            <div className="add-event-popup">
                <div className="overlay">
                    <div className="cover-img">
                        <img src={event.cover} />
                    </div>
                    <AdminInput val={event.cover} text="Image URL" field="half" />
                    <AdminInput val={event.eventLink} text="Event Link" field="half" />
                    <AdminInput val={event.title} text="Event Name" field="full" />
                    <AdminInput val={event.committee} text="Committee" field="committee" />
                    <AdminInput val={event.attendancePoints} text="Points" field="small" />
                    <div className="split"></div>
                    <AdminInput val={this.state.startDate} onChange={this.handleChangeStartDate} isDatePicker={true} text="Start Date" field="medium"/>

                    <AdminInput val={event.startDate && event.startDate.format("hh:mm")} placeholder={"hh:mm"} text="Start Time" mask={timeMask} field="medium" />
                    <AdminInput val={event.startDate && event.startDate.format("a")} placeholder={"am"} text="" mask={"aa"} field="small time-of-day" />


                    <AdminInput val={this.state.endDate} onChange={this.handleChangeEndDate} isDatePicker={true} text="End Date" field="medium"/>

                    <AdminInput val={event.startDate && event.endDate.format("hh:mm")} placeholder={"hh:mm"} text="End Time" mask={timeMask} field="medium" />
                    <AdminInput val={event.startDate && event.endDate.format("a")} placeholder={"am"} text="" mask={"aa"} field="small time-of-day" />





                    <AdminInput val={event.location} text="Location" field="full" />
                    <AdminInput val={event.description} text="Description" field="full" />
                    <div className="buttons">
                        <Button onClick={this.props.onClickAdd} className="add-event-button" style="green" text={this.props.isEdit ? "Update" : "Add"} icon="" />

                        <Button onClick={this.props.onClickCancel} className="" style="red" text="Cancel" icon="" />
                    </div>
                </div>

            </div>
        );
 */