import React, { PropTypes } from 'react'
import Button from 'components/Button/index'

class EventDropdown extends React.Component {
    render () {
        console.log(this.props.event);
        const event = this.props.event;
        return(
            <div className="event-dropdown">
                <div className="event-top">
                    <div className="dropdown-left">
                        <span className="Title-2Secondary">Points</span>
                        <span className="event-points-val Display-2Secondary">{event.attendancePoints}</span>
                        <Button className="event-button" style="event-button" icon="fa-facebook-square" text="Event Page"/>
                        <Button className="event-button" style="event-button" icon="fa-file" text="Resources"/>

                    </div>
                    <div className="dropdown-right">
                        <p className="Subheader-2Secondary">{event.description}</p> 
                    </div>
                </div>
                <div className="minimize">
                    <i className="fa fa-chevron-up fa-3x minimize-icon" aria-hidden="true"></i>
                </div>
            </div>
        );
    }
}

export default EventDropdown;
