import React from 'react';
import Config from 'config';

export default class ConfirmAccountComponent extends React.Component {
    render() {
        return (
            <div className="reset-pass-component">
                <a href="/login" className="no-style Title-2White login-link">&lt; Back to Login</a>
                <div className="card">
                    <p className="question">Confirm your Account</p>
                </div>
                <img src={Config.organization.logoLight} className="corner-logo" />
            </div>
        );
    }
}