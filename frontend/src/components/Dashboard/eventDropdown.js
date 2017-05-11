import React, { PropTypes } from 'react'
import Button from 'components/Button/index'

class EventDropdown extends React.Component {
    render () {
        return(
            <div className="event-dropdown">
                <div className="event-top">
                    <div className="dropdown-left">
                        <span className="Title-2Secondary">Points</span>
                        <span className="event-points-val Display-2Secondary">5</span>
                        <Button className="event-button" style="event-button" icon="fa-facebook-square" text="Event Page"/>
                        <Button className="event-button" style="event-button" icon="fa-file" text="Resources"/>

                    </div>
                    <div className="dropdown-right">
                        <p className="Subheader-2Secondary">Your job-hunt should not end when you get all your dream job offers. There is one last step that many people (especially college students) always forget about: negotiation. This is unfortunate because negotiation takes very little work, but can have a very large impact on your compensation. By explaining how to negotiate, we hope to dispel the fear around negotiation and teach you how to maximize your compensation package.</p>
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
