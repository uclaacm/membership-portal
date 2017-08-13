import React from 'react'
import Config from 'config'
import Logo from './logo'
import SignIn from './signIn'
import SignUp from './signUp'

class LoginForm extends React.Component {
	constructor(props) {
		super(props);
		this.state = { disableForm: false };
	}

	handleLogin(e) {
		e.preventDefault();
		if (!this.state.disableForm) {
			this.setState(prev => Object.assign({}, prev, { disableForm: true }));
			const email = this.refs.email.value;
			const password = this.refs.password.value;
			this.props.onsubmit(email, password);
		}
	};

	componentWillReceiveProps(nextProps) {
		this.setState(prev => Object.assign({}, prev, { disableForm: false }));
	}

	render() {
		return(
			<form className="login-input" onSubmit={e => this.handleLogin(e)}>
				<p>Email</p>
				<input type="text" placeholder="example@ucla.edu" ref="email"></input>
				<p>Password</p>
				<input type="password" placeholder="&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;" ref="password"></input>
				{ this.props.error ? <span><b>Error</b>: {this.props.error}</span> : <span>&nbsp;</span> }
				<SignIn loading={this.state.disableForm} />
			</form>
		);
	}
}

export default class LoginSidebar extends React.Component {
	render () {
		return(
			<div className="login-sidebar">
				<div className="login-container">
					<Logo pic={Config.organization.logoLight}/>
					<LoginForm onsubmit={this.props.onsubmit} error={this.props.error}/>
					<SignUp/>
				</div>
			</div>
		);
	}
}