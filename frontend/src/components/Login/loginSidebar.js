import React from 'react';
import Config from 'config';
import Logo from './logo';
import GoogleLogin from 'react-google-login';

export default class LoginSidebar extends React.Component {
  constructor(props) {
    super(props);
    this.state = { err: null };
  }

  handleLogin(response) {
    if (!response || !response.tokenId) return;

    this.props.onsubmit(response.tokenId)
  }

  handleError(error) {
    let err = '';
    switch (error) {
      case "idpiframe_initialization_failed":
        err = "Third party cookies disabled.";
        break;
      default:
        err = "Sign in failed."
        break;
    }
    this.setState({err:err})
  }

  render() {
    return (
      <div className="login-sidebar">
        <div className="login-container">
          <Logo pic={Config.organization.logoLight} />
          <GoogleLogin
            clientId={Config.google.clientId}
            onSuccess={this.handleLogin.bind(this)}
            onFailure={this.handleError.bind(this)}
            cookiePolicy={'single_host_origin'}
          />
          { this.state.err ? (
            <span>
              <b>Error</b>
          :
                {' '}
                {this.state.err}
            </span>
          ) : <span>&nbsp;</span>}
        </div>
      </div>
    );
  }
}
