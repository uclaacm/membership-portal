import React from 'react';
import Config from 'config';
import Button from 'components/Button/index';
import GoogleLogin from 'react-google-login';

export default class GoogleLoginCard extends React.Component {
  render() {
    return (
      <div className="card google-login-card">
        <img src={Config.organization.logo} />
        <p className="question">Create an Account</p>
          <GoogleLogin
            clientId={Config.google.clientId}
            onSuccess={this.props.googleCallback}
            onFailure={this.props.googleCallback}
            cookiePolicy={'single_host_origin'}
          />
        <p className="info">
We only use your Google to fetch your first name, last name, and profile picture. We will never post on your Google or read any other information from your Google in the future.
          <i><a to="#" onClick={this.props.skipGoogleLogin}>Skip this step</a></i>
        </p>
      </div>
    );
  }
}
