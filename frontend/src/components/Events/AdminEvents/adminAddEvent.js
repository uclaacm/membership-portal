import React from 'react'
import AdminInput from './adminInput'
import Button from 'components/Button/index'

export default class AdminAddEvent extends React.Component {
    render() {
        console.log("here", this.props.event);
        const event = this.props.event;
        const header = (this.props.isEdit? "Update" : "Add") + " Event";
        const timeMask = "99:99";
        const dateMask = "99/99/99";



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
                    <AdminInput val={""} text="Start Time" mask={timeMask} field="half" />
                    <AdminInput val={""} text="Start Date" mask={dateMask} field="half" />
                    <AdminInput val={""} placeholder={"AM"} text="" mask={"aa"} field="small" />
                    <AdminInput val={""} text="End Time" mask={timeMask} field="half" />
                    <AdminInput val={""} text="" mask={"aa"} field="small" />
                    <AdminInput text="End Date" mask={dateMask} field="half"/>
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