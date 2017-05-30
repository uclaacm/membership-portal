import React from 'react'

import Button from 'components/Button/index'
import EventDay from './eventDay'
import EventCard from './eventCard'

export default class UserEvents extends React.Component {
    constructor(props) {
        super(props);
        this.state = {showAddEvent: false}
        this.showAddEvent = this.showAddEvent.bind(this);
        this.saveAddEventParent = this.saveAddEventParent.bind(this);
        this.cancelAddEventParent = this.cancelAddEventParent.bind(this);
    }

    showAddEvent(e) {
        console.log(e);
        this.setState(prev => ({
            showAddEvent: true
        }));
    }

    saveAddEventParent(e) {
        console.log("saved in parent");
        this.setState(prev => ({
            showAddEvent: false
        }));
    }

    cancelAddEventParent(e) {
        console.log("cancel in parent");
        this.setState(prev => ({
            showAddEvent: false
        }));
    }

    render () {
        const emptyEvent = {
            cover: "",
            title: "[Title: Goes here]",
            committee: "",
            description: "[Your event description goes here]",
            eventLink: "",
            attendancePoints: "[XZ]",
            startDate: "[hh:mm]",
            endDate: "[hh:mm]",
            location: "[1234 Building]",
            empty: true
        }
        if (this.props.error) {
            return <div className="events-dashboard"><h1>{this.props.error}</h1></div>;
        } else {
            return (
                <div className="events-dashboard">
                    {!this.state.showAddEvent && <Button
                        className={ "checkin-button" }
                        style="blue collapsible"
                        icon="fa-plus"
                        text="Add Event"
                        onClick={ this.showAddEvent } />}
                    {this.state.showAddEvent && <EventCard admin={true} event={emptyEvent} addEvent={true} saveAddEventParent={this.saveAddEventParent} cancelAddEventParent={this.cancelAddEventParent}/>}
                    { this.props.events.map((day, i) => <EventDay day={day} key={i} admin={true} />) }
                </div>
            );
        }
    }
}