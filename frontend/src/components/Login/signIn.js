import React, { PropTypes } from 'react'

class SignIn extends React.Component {
    render () {
        return(
            <div className="sign-in">
                <button className="input-button sign-in-button">Sign In</button>
                <a className="input-text forgot-password" href="#">I forgot my password</a>
            </div>
        );
    }
}

export default SignIn;
