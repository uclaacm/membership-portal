import React, { PropTypes } from 'react'

class SignUp extends React.Component {
    render () {
        return(
            <div className="sign-up">
                <a className="input-text forgot-password" href="#">Don't have an account yet?</a>
                <button className="input-button">Sign Up</button>
            </div>
        );
    }
}

export default SignUp;
