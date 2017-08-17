import React from 'react'
import Button from 'components/Button/index'

export default class SignUp extends React.Component {
	render() {
		return(
			<div className="sign-up">
				<a className="input-text new-account Body-2White" href="/register">Don't have an account yet?</a>
				<a className="no-style" href="/register"><Button className="input-button" style="blue-signup" text="Sign Up"/></a>              
			</div>
		);
	}
}