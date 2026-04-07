import React from 'react';
import PropTypes from 'prop-types';
import Config from 'config';
import Button from 'components/Button';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import Logo from './logo';
import Banner from './banner';
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
    const { loginError } = this.props;
    const displayErr = loginError || err;

    return (
      <GoogleOAuthProvider clientId={Config.google.clientId}>
        <div className="login-sidebar">
          <div className='banner-container'>
            <Banner decorative={true} />
          </div>
          <div className="login-container">
            <Logo pic={'/assets/images/acm_wordmark_chapter.svg'} />
            <h1 className="login-title">Member Login</h1>
            <p className="login-description">
             Access exclusive resources, event registrations, and connect with the largest Computer Science community at UCLA.
            </p>
            <p className="login-description" style={{marginBottom: '5px'}}>
              Please use your UCLA email to sign in.
            </p>

            <div className="sign-in">
              <GoogleLogin
                onSuccess={this.handleLogin}
                onError={this.handleError}
                shape="rectangular"
                logo_alignment="center"
                width="250px"
              />
            </div>

            <a className="back-btn" href='https://acm.cs.ucla.edu/'>Back to ACM website
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
            <path d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 73.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z"/>
            </svg>
            </a>

            {displayErr ? (
              <span className="login-error">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="login-error-icon">
                  <path d="M256 32c14.2 0 27.3 7.5 34.5 19.8l216 368c7.3 12.4 7.3 27.7 .2 40.1S486.3 480 472 480L40 480c-14.3 0-27.6-7.5-34.7-19.8s-7-27.8 .2-40.1l216-368C228.7 39.5 241.8 32 256 32zm0 128c-13.3 0-24 10.7-24 24l0 112c0 13.3 10.7 24 24 24s24-10.7 24-24l0-112c0-13.3-10.7-24-24-24zm32 224a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z"/>
                </svg>
                {displayErr}
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
