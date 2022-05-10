import React from "react";
import Config from "config";
import Button from "components/Button";
import Logo from "./logo";
import GoogleLogin from "react-google-login";

export default class LoginSidebar extends React.Component {
  constructor(props) {
    super(props);
    this.state = { err: null };
  }

  handleLogin(response) {
    if (!response || !response.tokenId) return;

    this.props.onsubmit(response.tokenId);
  }

  handleError(error) {
    let err = "";
    switch (error.error) {
      case "idpiframe_initialization_failed":
        err = "Third-party cookies disabled. Enable third-party cookies to sign in.";
        break;
      default:
        err = "Sign in failed.";
        break;
    }
    this.setState({ err: err });
  }

  render() {
    return (
      <div className="login-sidebar">
        <div className="login-container">
          <Logo pic={Config.organization.logoLight} />

          <div className="sign-in">
            <GoogleLogin
              clientId={Config.google.clientId}
              render={renderProps => (
                <Button
                  onClick={renderProps.onClick}
                  disabled={renderProps.disabled}
                  text="Sign in with Google"
                  customIcon="/assets/images/GoogleLogo.svg"
                  color="gray"
                  style="small-text"
                />
              )}
              buttonText="Sign in with Google"
              onSuccess={this.handleLogin.bind(this)}
              onFailure={this.handleError.bind(this)}
              cookiePolicy={"single_host_origin"}
              hostedDomain={Config.google.hostedDomain}
            />
          </div>

          {this.state.err ? (
            <span>
              <b>Error</b>: {this.state.err}
            </span>
          ) : (
            <span>&nbsp;</span>
          )}
        </div>
      </div>
    );
  }
}
