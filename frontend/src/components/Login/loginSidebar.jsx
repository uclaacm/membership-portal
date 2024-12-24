import React from 'react';
import PropTypes from 'prop-types';
import Config from 'config';
import Button from 'components/Button';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import Logo from './logo';

export default class LoginSidebar extends React.Component {
  constructor(props) {
    super(props);
    this.state = { err: null };
    this.handleLogin = this.handleLogin.bind(this);
    this.handleError = this.handleError.bind(this);
  }

  handleLogin(response) {
    if (!response || !response.credential) return;

    const { onsubmit } = this.props;
    onsubmit(response.credential);
  }

  handleError(error) {
    const err = error ? 'Sign in failed.' : '';
    this.setState({ err });
  }

  render() {
    const { err } = this.state;

    return (
      <GoogleOAuthProvider clientId={Config.google.clientId}>
        <div className="login-sidebar">
          <div className="login-container">
            <Logo pic={Config.organization.logoLight} />

            <div className="sign-in">
              <GoogleLogin
                onSuccess={this.handleLogin}
                onError={this.handleError}
                render={renderProps => (
                  <Button
                    onClick={renderProps.onClick}
                    disabled={renderProps.disabled}
                    text="Sign in with Google"
                    customIcon="/assets/images/GoogleLogo.svg"
                    color="gray"
                    style={{ fontSize: 'small' }} // Ensure style is an object
                  />
                )}
              />
            </div>

            {err ? (
              <span>
                <b>Error</b>
                :
                {err}
              </span>
            ) : (
              <span>&nbsp;</span>
            )}
          </div>
        </div>
      </GoogleOAuthProvider>
    );
  }
}

LoginSidebar.propTypes = {
  onsubmit: PropTypes.func.isRequired,
};
