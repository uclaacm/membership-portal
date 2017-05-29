import React from 'react'

import Button from 'components/Button/index'
import EventDay from './eventDay'

export default class UserEvents extends React.Component {
    constructor(props) {
        super(props);
    }

    render () {
        if (this.props.error) {
            return <div className="events-dashboard"><h1>{this.props.error}</h1></div>;
        } else {
            return (
                <div className="events-dashboard">
                    <Button
                        className={ "checkin-button" }
                        style="blue collapsible"
                        icon="fa-calendar-check-o"
                        text="Add Event"
                        onClick={ this.showAddEvent } />
                    { this.props.events.map((day, i) => <EventDay day={day} key={i} admin={true} />) }
                </div>
            );
        }
    }
}