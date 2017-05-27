import Config from 'config';
import React, { PropTypes } from 'react';
import LoginSidebar from './loginSidebar';

class LoginComponent extends React.Component {
    render () {
        return(
            <div className="login">
                <LoginSidebar onsubmit={this.props.onsubmit} error={this.props.error}/>
                <div className="login-tile">
                    <div className="login-tile-inner"></div>
                </div>

            </div>
        )
    }
}

export default LoginComponent;
