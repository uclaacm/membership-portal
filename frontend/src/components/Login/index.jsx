import React from 'react';
import LoginSidebar from './loginSidebar';
import Banner from './banner';

export default class LoginComponent extends React.Component {
  render() {
    return (
      <div className="login">
        <LoginSidebar onsubmit={this.props.onsubmit} />
        <div className="login-tile">
          <Banner decorative={false} />
        </div>
      </div>
    );
  }
}
