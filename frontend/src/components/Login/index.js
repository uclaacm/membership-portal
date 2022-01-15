import React from 'react';
import Config from 'config';
import LoginSidebar from './loginSidebar';

export default class LoginComponent extends React.Component {
  render() {
    return (
      <div className="login">
        <LoginSidebar onsubmit={this.props.onsubmit} />
        <div className="login-tile">
          <div className="login-tile-inner" style={{ backgroundImage: `url(${Config.organization.loginTileBackground})` }} />
        </div>
      </div>
    );
  }
}
