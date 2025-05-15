import React from 'react';
import Config from 'config';
import LoginSidebar from './loginSidebar';
import Banner from './banner';

export default class LoginComponent extends React.Component {
  componentDidMount() {
    // Ensure scrolling is disabled on login page
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
  }

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
