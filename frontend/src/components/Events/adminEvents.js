import React from 'react'

import Button from 'components/Button/index'
import EventMonth from './eventMonth'
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

        //Group events by month
        
        var allEvents = [];
        let tempMonth = [];
        var curMonth;
        var monthlyEvents = [];
        for(let i = 0; i < this.props.events.length; i++) {
            for(let j = 0; j < this.props.events[i].events.length; j++) {
                let event = {event: this.props.events[i].events[j]};//, date : this.props.events[i].date};
                this.props.events[i].events[j].date = this.props.events[i].date;
                allEvents.push(this.props.events[i].events[j]);
            }
        }

        if(allEvents.length > 0) {
            curMonth = allEvents[0].date.month();
        }
        for(let i = 0; i < allEvents.length; i++) {
            if(allEvents[i].date.month() === curMonth) {
                tempMonth.push(allEvents[i]);
            }
            else {
                curMonth = allEvents[i].date.month();
                monthlyEvents.push(tempMonth);
                tempMonth = [];
                tempMonth.push(allEvents[i]);
            }

        }
        monthlyEvents.push(tempMonth);

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

        // console.log("Day", this.props.events);
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

                    {/*{ this.props.events.map((day, i) => <EventDay day={day} key={i} admin={true} />) }*/}

                    { monthlyEvents.map((ev, i) => <EventMonth event={ev} key={i} admin={this.props.admin} onClick={this.props.onClick} />) }
                </div>
            );
        }
    }
}