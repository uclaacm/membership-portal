import React, { PropTypes } from 'react'

class LoginEmail extends React.Component {
    render () {
        return(
            <div className="login-input">
                <p>Email</p>
                <input type="text" placeholder="example@ucla.edu"></input>
            </div>
        );
    }
}

export default LoginEmail;
