import React from 'react'
import DOMPurify from 'dompurify'
import Button from 'components/Button/index'

export default class EventCard extends React.Component {
    constructor(props) {
        super(props);
        this.state = { selected: false };
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick(e) {
        if (this.props.onClick)
            return this.props.onClick(e);
        this.setState(prev => ({
            selected: !prev.selected
        }));
    }

    render() {
        const event = this.props.event;
        const className = "event-card" + (this.props.admin ? " admin-card" : "") + (this.state.selected ? " selected" : "");
        return(
            <div className={className} onClick={this.handleClick}>
                <div className="cover" style={{ backgroundImage: 'url('+event.cover+')' }}></div>
                <div className="content">
                    <h2>{event.title}</h2>
                    <h3>ACM {event.committee}</h3>
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
                            <span className="time">{event.startDate.format("h:mm a")} &mdash; {event.endDate.format("h:mm a")}</span>
                            <p className="location">{event.location}</p>
                        </div>
                        <div className="buttons">
                            <Button className="edit-event-button" style="blue collapsed" text="" icon="fa-pencil" />
                            <Button className="delete-event-button" style="red collapsed" text="" icon="fa-times" />
                        </div>
                        <div style={{clear: "both"}}></div>
                    </div>
                </div>
            </div>
        );
    }
}