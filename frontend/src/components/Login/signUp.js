import React, { PropTypes } from 'react'
import Button from 'components/Button/index'

class SignUp extends React.Component {
    render () {
        return(
            <div className="sign-up">
                <a className="input-text new-account Body-2White" href="#">Don't have an account yet?</a>
                <Button className="input-button" style="blue-signup" text="Sign Up"/>                
            </div>
        );
    }
}

export default SignUp;
