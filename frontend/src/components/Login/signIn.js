import React, { PropTypes } from 'react'
import Button from 'components/Button/index'

class SignIn extends React.Component {

    render () {
        return(
            <div className="sign-in">
                <Button className="input-button" style="green" text="Sign In"/>
                <a className="input-text forgot-password Body-2White" href="#">I forgot my password</a>
            </div>
        );
    }
}

export default SignIn;
