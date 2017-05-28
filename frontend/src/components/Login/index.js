import React from 'react';
import Config from 'config';
import LoginSidebar from './loginSidebar';

export default class LoginComponent extends React.Component {
    render () {
        return (
            <div className="login">
                <LoginSidebar onsubmit={this.props.onsubmit} error={this.props.error}/>
                <div className="login-tile">
                    <div className="login-tile-inner"></div>
                </div>
            </div>
        )
    }
}