import React, { PropTypes } from 'react'
import Logo from './logo'
import LoginEmail from './loginEmail'
import LoginPassword from './loginPW'
import SignIn from './signIn'
import SignUp from './signUp'

class LoginSidebar extends React.Component {
    render () {
        return(
            <div className="login-sidebar">
                <Logo pic="https://pbs.twimg.com/profile_images/821079138060496896/7yR9rQOY.jpg"/>
                <LoginEmail/>
                <LoginPassword/>
                <SignIn/>
                <SignUp/>
            </div>
        );
    }
}

export default LoginSidebar;
