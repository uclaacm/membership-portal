import React from 'react'
import AdminInput from './adminInput'
import Button from 'components/Button/index'

export default class AdminAddEvent extends React.Component {
    render() {
        console.log("here", this.props.event);
        const event = this.props.event;
        const header = (this.props.isEdit? "Update" : "Add") + " Event";
        return (
            <div className="add-event-popup">
                <div className="overlay">
                    <span className="header LargeSecondary">{header}</span>
                    <AdminInput placeholder={event.cover} text="Image URL" field="half" />
                    <AdminInput placeholder={event.eventLink}text="Event Link" field="half"/>
                    <AdminInput placeholder={event.title}text="Event Name" field="full"/>
                    <AdminInput placeholder={event.committee}text="Committee" field="committee"/>
                    <AdminInput placeholder={event.attendancePoints}text="Points" field="points"/>
                    <div className="split"></div>
                    <AdminInput text="Start Time" field="half" />
                    <AdminInput text="Start Date" field="half" />
                    <AdminInput text="End Time" field="half" />
                    <AdminInput text="End Date" field="half"/>
                    <AdminInput placeholder={event.location}text="Location" field="full"/>
                    <AdminInput placeholder={event.description}text="Description" field="full"/>
                    <div className="buttons">
                        <Button onClick={this.props.onClickAdd} className="add-event-button" style="green" text={this.props.isEdit ? "Update" : "Add"} icon="" />
                        
                        <Button onClick={this.props.onClickCancel} className="" style="red" text="Cancel" icon="" />
                    </div>
                </div>
                    
            </div>
        );
    }
}