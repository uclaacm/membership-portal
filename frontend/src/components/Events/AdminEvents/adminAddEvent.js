import React from 'react'
import AdminInput from './adminInput'
import Button from 'components/Button/index'

export default class AdminAddEvent extends React.Component {
    render() {
        console.log("here", this.props.event);
        const event = this.props.event;
        const header = (this.props.isEdit? "Update" : "Add") + " Event";
        const timeMask = "99:99";
        const dateMask = "99-99-99";

        const startDate = event.startDate ? (event.startDate.format("MM-D-YY")) : "";
        const endDate = event.endDate ? (event.endDate.format("MM-D-YY")) : "";
        console.log

        const startTime = event.startDate ? (event.startDate.format("HH:mm")) : "";
        console.log(startTime);


        //2pm returns 14:00
        var endTime = event.endDate ? (event.endDate.format("h:mm a")) : "";
        //h:mm gives the hour/min up to 12
        //a gives am or pm

        console.log(endTime);
  
        // console.log("Hr", hr);
        // console.log("am?", am);


        return (
            <div className="add-event-popup">
                <div className="overlay">
                    <span className="header LargeSecondary">{header}</span>
                    <AdminInput val={event.cover} text="Image URL" field="half" />
                    <AdminInput val={event.eventLink}text="Event Link" field="half"/>
                    <AdminInput val={event.title}text="Event Name" field="full"/>
                    <AdminInput val={event.committee}text="Committee" field="committee"/>
                    <AdminInput val={event.attendancePoints}text="Points" field="small"/>
                    <div className="split"></div>
                    <AdminInput val={event.startDate && event.startDate.format("hh:mm")} placeholder={"hh:mm"} text="Start Time" mask={timeMask} field="medium" />
                    <AdminInput val={event.startDate && event.startDate.format("a")} placeholder={"am"} text="" mask={"aa"} field="small time-of-day" />
                    <AdminInput val={event.startDate && startDate} placeholder={"mm-dd-yy"} text="Start Date" mask={dateMask} field="medium" />
                    <AdminInput val={event.startDate && event.endDate.format("hh:mm")} placeholder={"hh:mm"} text="End Time" mask={timeMask} field="medium" />
                    <AdminInput val={event.startDate && event.endDate.format("a")} placeholder={"am"} text="" mask={"aa"} field="small time-of-day" />
                    <AdminInput val={endDate} placeholder={"mm-dd-yy"} text="End Date" mask={dateMask} field="medium"/>
                    <AdminInput val={event.location}text="Location" field="full"/>
                    <AdminInput val={event.description}text="Description" field="full"/>
                    <div className="buttons">
                        <Button onClick={this.props.onClickAdd} className="add-event-button" style="green" text={this.props.isEdit ? "Update" : "Add"} icon="" />
                        
                        <Button onClick={this.props.onClickCancel} className="" style="red" text="Cancel" icon="" />
                    </div>
                </div>
                    
            </div>
        );
    }
}