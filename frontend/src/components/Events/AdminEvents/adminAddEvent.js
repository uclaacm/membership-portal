import React from 'react'
import AdminInput from './adminInput'
import Button from 'components/Button/index'

import moment from 'moment';

import TimePicker from 'rc-time-picker';
import 'rc-time-picker/assets/index.css';

export default class AdminAddEvent extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            startDate: this.props.event.startDate,
            endDate: this.props.event.endDate
        };
        this.handleChangeStart = this.handleChangeStart.bind(this);
        this.handleChangeEnd = this.handleChangeEnd.bind(this);

        this.onChange=this.onChange.bind
    }

    handleChangeStart(date) {
        this.setState({
            startDate: date
        });
    }

    handleChangeEnd(date) {
        this.setState({
            endDate: date
        });
    }

    onChange(value) {
        console.log(value && value.format(format));
    }


    render() {
        console.log("here", this.props.event);
        const event = this.props.event;
        const header = (this.props.isEdit ? "Update" : "Add") + " Event";
        const timeMask = "99:99";
        const dateMask = "99-99-99";

        const startDate = event.startDate ? (event.startDate.format("MM-D-YY")) : "";
        const endDate = event.endDate ? (event.endDate.format("MM-D-YY")) : "";

        const startTime = event.startDate ? (event.startDate.format("HH:mm")) : "";



        //2pm returns 14:00
        //h:mm gives the hour/min up to 12
        //a gives am or pm
        var endTime = event.endDate ? (event.endDate.format("h:mm a")) : "";

        return (
            <div className="add-event-popup">
                <div className="overlay">
                    <span className="header LargeSecondary">{header}</span>
                    <AdminInput val={event.cover} text="Image URL" field="half" />
                    <AdminInput val={event.eventLink} text="Event Link" field="half" />
                    <AdminInput val={event.title} text="Event Name" field="full" />
                    <AdminInput val={event.committee} text="Committee" field="committee" />
                    <AdminInput val={event.attendancePoints} text="Points" field="small" />
                    <div className="split"></div>
                    <AdminInput val={this.state.startDate} onChange={this.handleChangeStart} isDatePicker={true} text="Start Date" field="medium"/>

                    <AdminInput val={event.startDate && event.startDate.format("hh:mm")} placeholder={"hh:mm"} text="Start Time" mask={timeMask} field="medium" />
                    <AdminInput val={event.startDate && event.startDate.format("a")} placeholder={"am"} text="" mask={"aa"} field="small time-of-day" />


                    <AdminInput val={this.state.endDate} onChange={this.handleChangeEnd} isDatePicker={true} text="End Date" field="medium"/>

                    <AdminInput val={event.startDate && event.endDate.format("hh:mm")} placeholder={"hh:mm"} text="End Time" mask={timeMask} field="medium" />
                    <AdminInput val={event.startDate && event.endDate.format("a")} placeholder={"am"} text="" mask={"aa"} field="small time-of-day" />

                    {/*<TimePicker
                        showSecond={false}
          
                        className="xxx"
                        format={format}
                        use12Hours
                    />*/}

                    <AdminInput val={event.location} text="Location" field="full" />
                    <AdminInput val={event.description} text="Description" field="full" />
                    <div className="buttons">
                        <Button onClick={this.props.onClickAdd} className="add-event-button" style="green" text={this.props.isEdit ? "Update" : "Add"} icon="" />

                        <Button onClick={this.props.onClickCancel} className="" style="red" text="Cancel" icon="" />
                    </div>
                </div>

            </div>
        );
    }
}