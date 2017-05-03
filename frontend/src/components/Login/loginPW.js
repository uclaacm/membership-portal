import React, { PropTypes } from 'react'

class LoginPassword extends React.Component {
    render () {
        return(
            <div className="login-input">
                <p>Password</p>
                <input type="password" placeholder="********" ></input>
            </div>
        );
    }
}

export default LoginPassword;
