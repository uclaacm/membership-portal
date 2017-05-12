import React, { PropTypes } from 'react';

import Config from 'config';

import LoginSidebar from './loginSidebar';

class LoginComponent extends React.Component {
    render () {
        return(
            <div className="login">
                <LoginSidebar onsubmit={this.props.onsubmit} error={this.props.error}/>
                <div className="login-tile">
                    {/*<img src="https://scontent-lax3-1.xx.fbcdn.net/v/t31.0-8/16178608_1467186616654744_8198615410108636476_o.jpg?oh=d9447a1aaa4f67eb1c229991639a2231&oe=59749D7B"/>*/}
                </div>

            </div>
        )
    }
}

export default LoginComponent;
