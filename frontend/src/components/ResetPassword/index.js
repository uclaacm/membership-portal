import React from 'react';
import Config from 'config';

export default class ResetPasswordComponent extends React.Component {
    render() {
        return (
            <div className="reset-pass-component">
                <a href="/login" className="no-style Title-2White login-link">&lt; Back to Login</a>
                <div className="card">
                    <p className="question">Forgot your password?</p>
                </div>
                <img src={Config.organization.logoLight} className="corner-logo" />
            </div>
        );
    }
}