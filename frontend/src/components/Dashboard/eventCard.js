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
        this.setState(prev => ({
            selected: !prev.selected
        }));
    }

    render() {
        const event = this.props.event;
        const extraContent = this.state.selected ? (
            <div>
                <div className="description" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(event.description) }}></div>
                <p><a target="_BLANK" href={event.eventLink}>Go to the event page</a></p>
            </div>
        ) : null;
        return(
            <div className={ "event-card" + (this.state.selected ? " selected" : "") } onClick={this.handleClick}>
                <div className="cover" style={{ backgroundImage: 'url('+event.cover+')' }}></div>
                <div className="content">
                    <h2>{event.title}</h2>
                    <h3>ACM {event.committee}</h3>
                    { extraContent }
                    <div className="subcontent">
                        <div className="left">
                            <span className="time">{event.startDate.format("h:mm a")} &mdash; {event.endDate.format("h:mm a")}</span>
                            <p style={{paddingBottom: 0}}>{event.location}</p>
                        </div>
                        <div className="right">
                            <div className="points">{event.attendancePoints}</div>
                            <div className="label">Points</div>
                        </div>
                        <div style={{clear: "both"}}></div>
                    </div>
                </div>
            </div>
        );
    }
}