import React from 'react';
import Button from 'components/Button';

export default class SuccessCard extends React.Component {
    render() {
        return (
            <div className="card success-card">
                <p className="question">Registration Complete</p>
                <a className="no-style" href="/events">
                    <Button className="continue-button" style="green" icon="fa fa-check" text="Continue to Dashboard" />
                </a>
            </div>
        );
    }
}