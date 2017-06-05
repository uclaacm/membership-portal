import React from 'react'

import Button from 'components/Button/index'
import EventMonth from './eventMonth'
import AdminAddEvent from './adminAddEvent'

export default class AdminEvents extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showAddEvent: false, isEditEvent: false,
            eventPlaceholder: {
                attendancePoints: "",
                attendanceCode: "",
                committee: "",
                cover: "",
                description: "",
                endDate: "",
                eventLink: "",
                location: "",
                startDate: "",
                title: "",
                startTime: ""
            }
        }
        this.showAddEvent = this.showAddEvent.bind(this);
        this.hideAddEvent = this.hideAddEvent.bind(this);
        this.addEvent = this.addEvent.bind(this);
        this.cancelAddEventParent = this.cancelAddEventParent.bind(this);
        this.handleEditClick = this.handleEditClick.bind(this);
    }

    //Shows the add event sidebar
    showAddEvent(e) {
        console.log(e);
        this.setState(prev => ({
            showAddEvent: true,
            eventPlaceholder: {
                attendancePoints: "",
                attendanceCode: "",
                committee: "",
                cover: "",
                description: "",
                endDate: null,
                eventLink: "",
                location: "",
                startDate: null,
                title: ""
            }
        }));
    }

    hideAddEvent(e) {
        this.setState(prev => {
            let newState = Object.assign({}, prev);
            newState.showAddEvent = false;
            return newState;
        });
    }

    //Handles when update/add event
    addEvent(event) {
        console.log(event);
        console.log(event.startDate.toDate());
        this.setState(prev => ({
            showAddEvent: false,
            isEditEvent: false
        }));
    }

    //Handles cancel add event
    cancelAddEventParent(e) {
        this.setState(prev => ({
            showAddEvent: false,
            isEditEvent: false
        }));
    }

    //This function is passed down to child so when edit button is clicked, can bring up the add/edit sidebar
    handleEditClick(param) {
        this.setState(prev => ({
            showAddEvent: true,
            isEditEvent: true,
            eventPlaceholder: param
        }));
    }

    render() {
        const events = this.props.events;
        let months = [];
        let i = 0;

        while (i < events.length) {
            let month = { date: events[i].startDate, days: [] };
            while (i < events.length && events[i].startDate.month() === month.date.month()) {
                if (month.days.length === 0 || events[i].startDate.date() !== month.days[month.days.length - 1].date.date())
                    month.days.push({ date: events[i].startDate, events: [events[i]] });
                else
                    month.days[month.days.length - 1].events.push(events[i]);
                i++;
            }
            months.push(month);
        }

        if (this.props.error) {
            return <div className="events-dashboard admin-dashboard"><h1>{this.props.error}</h1></div>;
        } else {
            return (
                <div className="events-dashboard admin-dashboard">
                    <AdminAddEvent event={this.state.eventPlaceholder} onClickAdd={this.addEvent} onClickCancel={this.cancelAddEventParent} isEdit={this.state.isEditEvent} showing={this.state.showAddEvent} />

                    {!this.state.showAddEvent && <Button
                        className="checkin-button"
                        style="blue collapsible"
                        icon="fa-plus"
                        text="Add Event"
                        onClick={this.showAddEvent} />}

                    {months.map((month, i) => <EventMonth month={month} key={i} handleEditClick={this.handleEditClick} />)}
                </div>
            );
        }
    }
}