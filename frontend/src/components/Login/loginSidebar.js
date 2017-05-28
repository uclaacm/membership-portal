import React from 'react'
import Logo from './logo'
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
        return this.props.error ? <span><b>Error</b>: {this.props.error}</span> : <span>&nbsp;</span>;
    }

    render() {
        return(
            <form className="login-input" onSubmit={(e) => this.handleLogin(e)}>
                <p>Email</p>
                <input type="text" placeholder="example@ucla.edu" ref="email"></input>
                <p>Password</p>
                <input type="password" placeholder="&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;" ref="password"></input>
                {this.renderAlert()}
                <SignIn />
            </form>
        );
    }
}



export default class LoginSidebar extends React.Component {
    render () {
        return(
            <div className="login-sidebar">
                <div className="login-container">
                    <Logo pic="https://pbs.twimg.com/profile_images/821079138060496896/7yR9rQOY.jpg"/>
                    <LoginForm onsubmit={this.props.onsubmit} error={this.props.error}/>
                    <SignUp/>
                </div>
            </div>
        );
    }
}