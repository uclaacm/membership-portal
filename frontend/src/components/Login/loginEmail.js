import React, { PropTypes } from 'react'

class LoginEmail extends React.Component {
    render () {
        return(
            <div className="login-input">
                <p className="Caption-2White">Email</p>
                <input className="" type="text" placeholder="example@ucla.edu"></input>
            </div>
        );
    }
}

export default LoginEmail;
