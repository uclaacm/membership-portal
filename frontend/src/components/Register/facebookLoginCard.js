import React from 'react'
import Config from 'config'
import Button from 'components/Button/index'
import FacebookLogin from 'react-facebook-login';

export default class FacebookLoginCard extends React.Component {
	render () {
		return(
			<div className="card fb-login-card">
				<img src={Config.organization.logo} />
				<p className="question">Create an Account</p>
				<div className="button-component">
					<FacebookLogin
						appId={Config.facebook.appId} 
						fields="name"
						autoload={true}
						cssClass="generic-button fb-login-button blue"
						icon="fa-facebook"
						callback={this.props.facebookCallback} />
				</div>
				<p className="info">We only use your Facebook to fetch your first name, last name, and profile picture. We will never post on your Facebook or read any other information from your Facebook in the future.</p>
			</div>
		);
	}
}