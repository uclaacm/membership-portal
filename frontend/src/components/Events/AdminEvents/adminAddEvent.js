import React from 'react'
import AdminInput from './adminInput'
import Button from 'components/Button/index'

export default class AdminAddEvent extends React.Component {
    render() {
        return (
            <div className="add-event-popup">
                <div className="overlay">
                    <AdminInput text="Image URL" field="half" />
                    <AdminInput text="Event Link" field="half"/>
                    <AdminInput text="Event Name" field="full"/>
                    <AdminInput text="Committee" field="committee"/>
                    <AdminInput text="Points" field="points"/>
                    <div className="split"></div>
                    <AdminInput text="Start" field="half" />
                    <AdminInput text="End" field="half"/>
                    <AdminInput text="Location" field="full"/>
                    <AdminInput text="Description" field="full"/>
                    <div className="buttons">
                        <Button onClick={this.props.onClickAdd} className="add-event-button" style="green" text={this.props.isEdit ? "Update" : "Add"} icon="" />
                        
                        <Button onClick={this.props.onClickCancel} className="" style="red" text="Cancel" icon="" />
                    </div>
                </div>
                    
            </div>
        );
    }
}