import React from 'react'
import Button from 'components/Button'

export default class CheckInPopup extends React.Component {
    constructor(props) {
        super(props);
    }
    
    render () {
        if (!this.props.showing)
            return null;

        return (
            <div className="overlay" onClick={ this.props.cancelAction }>
                <div className="checkin-popup" onClick={ (e) => e.stopPropagation() }>
                    <h2>Enter the attendance code:</h2>
                    <form onSubmit={ this.props.submitAction }>
                        <input type="text" placeholder="Attendance code..." /><br />
                        <Button className="checkin-submit-button" style="blue" text="Check In" icon="fa-calendar-check-o" />
                        { this.props.checkInError }
                    </form>
                </div>
            </div>
        );
    }
}