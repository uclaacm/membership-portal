import React from 'react';
import { NavLink } from 'react-router-dom';
import Config from 'config';

import Button from 'components/Button';

export default class SuccessCard extends React.Component {
  render() {
    return (
      <div className="card success-card">
        <img src={Config.organization.logo} />
        <p className="question">Password Reset Sent</p>
        <p className="info">We sent you an email with instructions to reset your password.</p>
      </div>
    );
  }
}
