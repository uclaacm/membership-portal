import React from 'react'
import {NavLink} from 'react-router-dom';
import Button from 'components/Button/index'

export default class SignIn extends React.Component {
	render () {
		return(
			<div className="sign-in">
				<Button className="input-button" style="green" text="Sign In"/>
				<NavLink to="/resetpassword" className="input-text forgot-password Body-2White">I forgot my password</NavLink>
			</div>
		);
	}
}