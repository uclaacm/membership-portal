import React, { PropTypes } from 'react'
import Button from 'components/Button/index'
import DOMPurify from 'dompurify';

class EventDropdown extends React.Component {
    render () {
        const event = this.props.event;
        return(
            <div className="event-dropdown">
                <div className="event-top">
                    <div className="dropdown-left">
                        <span className="Title-2Secondary">Points</span>
                        <span className="event-points-val Display-2Secondary">{event.attendancePoints}</span>
                        <Button className="event-button" style="blue" icon="fa-facebook-square" text="Event Page"/>
                        <Button className="event-button" style="blue" icon="fa-file" text="Resources"/>
                    </div>
                    <div className="dropdown-right">
                        <p className="Subheader-2Secondary" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(event.description) }}></p>
                    </div>
                </div>
                {/*<div className="minimize">
                    <i className="fa fa-chevron-up fa-3x minimize-icon" aria-hidden="true"></i>
                </div>*/}
            </div>
        );
    }
}

export default EventDropdown;
