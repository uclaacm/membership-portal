import React, { PropTypes } from 'react'

class LoginPassword extends React.Component {
    render () {
        return(
            <div className="login-input">
                <p className="Caption-2White">Password</p>
                <input type="password" placeholder="********" ></input>
            </div>
        );
    }
}

export default LoginPassword;
