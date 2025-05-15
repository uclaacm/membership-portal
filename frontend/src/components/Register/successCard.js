import React from 'react';
import { NavLink } from 'react-router-dom';
import Config from 'config';
import Button from 'components/Button';
import Logo from '../Login/logo';
import Banner from '../Login/banner';

export default class SuccessCard extends React.Component {
  render() {
    return (
      <div className="login-sidebar success-sidebar">
        <div className='banner-container'>
          <Banner decorative={true} />
        </div>
        <div className="login-container">
          <Logo pic={'/assets/images/acm_wordmark_chapter.svg'} />
          <h1 className="login-title">Registration Complete</h1>
          <p className="login-description">
            You're a member of {Config.organization.shortName} now! You can now access all member resources and benefits.
          </p>
          
          <div className="sign-in">
            <NavLink to="/events">
              <Button className="continue-button" style="green" icon="fa fa-check" text="Continue to Dashboard" />
            </NavLink>
          </div>
        </div>
      </div>
    );
  }
}
