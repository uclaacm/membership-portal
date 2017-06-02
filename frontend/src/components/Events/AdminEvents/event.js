import React from 'react'
import DOMPurify from 'dompurify'
import Button from 'components/Button/index'

export default class AdminEventCard extends React.Component {
    constructor(props) {
        super(props);
        this.state = { selected: false, editable: false };
        this.handleClick = this.handleClick.bind(this);
        this.editEvent = this.editEvent.bind(this);
    }

    //Handles button click to edit event
    editEvent(e) {
        this.setState(prev => ({
            editable: !prev.editable
        }))
        this.props.handleEditClick(this.props.event);
    }

    //Handles button click to delete event
    deleteEvent(e) {
        console.log("Delete event button pressed!");
    }

    //Handles button click to save event that is edited
    saveEvent(e) {
        this.setState(prev => ({
            editable: !prev.editable
        }))
        console.log("Save event button pressed!");

    }

    //
    cancelEditEvent(e) {
        this.setState(prev => ({
            editable: !prev.editable
        }))
    }

    handleClick(e) {
        if (this.props.onClick)
            return this.props.onClick(e);
        this.setState(prev => ({
            selected: !prev.selected
        }));

        console.log("clicked")
    }

    render() {
        const event = this.props.event;
        const className = "admin-event-tile" + (this.state.selected ? " selected" : "");  
        return (
            <div className={className} onClick={this.handleClick}>
                <div className="top">
                    <div className="cover" style={{ backgroundImage: 'url('+event.cover+')' }}></div>
                    <div className="event-header">
                        <span className="event-title Headline-2Primary">{event.title}</span><br/>
                        <span className="event-committee Title-2Secondary">{event.committee}</span>
                    </div>
                </div>
                <div className="bottom">
                    <div className="midcontent">
                        <div className="description" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(event.description) }}></div>
                        <p className="event-link"><a target="_BLANK" href={event.eventLink}>Go to the event page</a></p>
                    </div>
                    <div className="subcontent">
                        <div className="left">
                            <div className="points">{event.attendancePoints}</div>
                            <div className="label">Points</div>
                        </div>
                        <div className="right">
                            <p  className="time">{event.empty ? event.startDate : event.startDate.format("h:mm a")} &mdash; {event.empty ? event.endDate : event.endDate.format("h:mm a")}</p>
                            <p className="location BodySecondary">{event.location}</p>
                        </div>
                        <div className="edit-delete-buttons">
                            <Button onClick={(e) => {
                                e.stopPropagation();
                                this.editEvent();
                            }
                            } className="edit-event-button" style={"collapsed" + " blue"} text="" icon="fa-pencil" />
                            <Button onClick={(e) => {
                                e.stopPropagation();
                                this.deleteEvent();
                            }
                            } className="delete-event-button" style="red collapsed" text="" icon="fa-trash-o" />
                        </div>
                        <div style={{clear: "both"}}></div>
                    </div>
                </div>
            </div>

        );
    }
}