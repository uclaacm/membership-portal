import React from 'react'
import DOMPurify from 'dompurify'
import Button from 'components/Button/index'

export default class EventCard extends React.Component {
    constructor(props) {
        super(props);
        this.state = { selected: false,
                       editable: false    
                     };
        this.handleClick = this.handleClick.bind(this);
        this.editEvent = this.editEvent.bind(this);
    }

    handleClick(e) {
        if (this.props.onClick)
            return this.props.onClick(e);
        
        if(this.state.editable) {
            return;
        }

        this.setState(prev => ({
            selected: !prev.selected
        }));
    }

    //Handles button click to edit event
    editEvent(e) {
        this.setState(prev => ({
            editable: !prev.editable
        }))
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

    render() {
        const event = this.props.event;
        if(this.props.addEvent) {
            this.state.selected = true;
            this.state.editable = true;
            
        }

        const className = "event-card" + (this.props.admin ? " admin-card" : "") + (this.state.selected ? " selected" : "") + (this.state.editable ? " editable" : "") + (this.props.addEvent ? " add-event-card" : "")
        return(

            <div className="admin-event-day-wrapper">
                <div className="event-day-class">
                    {event.date ? event.date.format("DD") : ""}<br/>
                    {event.date ? event.date.format("ddd") : ""}
                </div>
                <div className={className} onClick={this.handleClick}>
                    <div className="cover" style={{ backgroundImage: 'url('+event.cover+')' }}></div>
                    <div className="content">
                        <h2 contentEditable={this.state.editable} className="event-title">{event.title}</h2>
                        <div className="editable-buttons">
                            <Button onClick={(e) => {
                                e.stopPropagation();
                                this.saveEvent();
                                this.props.addEvent && this.props.saveAddEventParent();
                            }
                            } className="edit-event-button" style={"collapsed" + (this.state.editable ? " green" : " blue")} text="" icon="fa-check" />
                            <Button onClick={(e) => {
                                e.stopPropagation();
                                this.cancelEditEvent();
                                this.props.addEvent && this.props.cancelAddEventParent();
                            }
                            }
                            className="delete-event-button" style="red collapsed" text="" icon="fa-times" />

                        </div>
                        <div style={{clear: "both"}}></div>
                        <h3>ACM {event.committee}</h3>
                        <div className="midcontent">
                            <div contentEditable={this.state.editable} className="description" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(event.description) }}></div>
                            <p className="event-link"><a target="_BLANK" href={event.eventLink}>Go to the event page</a></p>
                        </div>
                        <div className="subcontent">
                            <div className="left">
                                <div contentEditable={this.state.editable} className="points">{event.attendancePoints}</div>
                                <div className="label">Points</div>
                            </div>
                            <div className="right">
                                <p contentEditable={this.state.editable} className="time">{event.empty ? event.startDate : event.startDate.format("h:mm a")} &mdash; {event.empty ? event.endDate : event.endDate.format("h:mm a")}</p>
                                <p contentEditable={this.state.editable} className="location">{event.location}</p>
                            </div>
                            <div className="edit-delete-buttons">
                                <Button onClick={(e) => {
                                    e.stopPropagation();
                                    this.editEvent();
                                }
                                } className="edit-event-button" style={"collapsed" + (this.state.editable ? " green" : " blue")} text="" icon="fa-pencil" />
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
            </div>
        );
    }
}