import React from 'react'
import Button from 'components/Button/index'

export default class AdminEventCard extends React.Component {
    constructor(props) {
        super(props);
        this.editEvent = this.editEvent.bind(this);
    }

    editEvent(e) {
        if (this.props.handleEditClick)
            this.props.handleEditClick(this.props.event);
    }

    render() {
        const event = this.props.event;
        return (
            <div className="admin-event-tile" onClick={this.editEvent}>
                <div className="top">
                    <div className="cover" style={{ backgroundImage: 'url('+event.cover+')' }}></div>
                    <div className="event-header">
                        <span className="event-title Headline-2Primary">{event.title}</span><br/>
                        <span className="event-committee Title-2Secondary">{event.committee}</span>
                    </div>
                </div>
            </div>
        );
    }
}