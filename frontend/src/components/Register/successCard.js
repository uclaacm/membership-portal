import React from 'react';
import { NavLink } from 'react-router-dom';
import Config from 'config';

import Button from 'components/Button';

export default class SuccessCard extends React.Component {
  render() {
    return (
      <div className="card success-card">
        <img src={Config.organization.logo} />
        <p className="question">Registration Complete</p>
        <NavLink to="/events">
          <Button className="continue-button" style="green" icon="fa fa-check" text="Continue to Dashboard" />
        </NavLink>
        <p className="info">
          You're a member of
          {Config.organization.shortName}
          {' '}
          now!
        </p>
      </div>
    );
  }
}
