import React, { PropTypes } from 'react'
import Logo from './logo'
import LoginEmail from './loginEmail'
import LoginPassword from './loginPW'
import SignIn from './signIn'
import SignUp from './signUp'

class LoginForm extends React.Component {

    handleLogin(e) {
        e.preventDefault();
        const email = this.refs.email.value;
        const password = this.refs.password.value;
        this.props.onsubmit(email, password);
    };

    renderAlert() {
        if (this.props.error) {
            console.log('error received');
            return(
                <span><strong>Error</strong> {this.props.error}</span>
            );
        }
    }

    render() {
        return(
            <form className="login-input" onSubmit={(e) => this.handleLogin(e)}>
                <p>Email</p>
                <input type="text" placeholder="example@ucla.edu" ref="email"></input>
                <p>Password</p>
                <input type="text" placeholder="********" ref="password"></input>
                {this.renderAlert()}
                <div className="sign-in">
                    <button className="input-button sign-in-button" type="submit">Sign In</button>
                    <a className="input-text forgot-password" href="#">I forgot my password</a>
                </div>
            </form>
        );
    }
}



class LoginSidebar extends React.Component {
    render () {
        return(
            <div className="login-sidebar">
                <div className="login-container">
                    <Logo pic="https://pbs.twimg.com/profile_images/821079138060496896/7yR9rQOY.jpg"/>
                    {/*<LoginEmail />
                    <LoginPassword/>*/}
                    <LoginForm onsubmit={this.props.onsubmit} error={this.props.error}/>

                    <SignUp/>
                </div>
            </div>
        );
    }
}

export default LoginSidebar;
