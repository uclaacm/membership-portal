import React from 'react';
import Config from 'config';

import Button from 'components/Button';

export default class ResetPassCard extends React.Component {
  constructor(props) {
    super(props);
    this.accessCode = null;
    const accessCodeMatch = window.location.pathname.match(/resetpassword\/(.+)$/);
    if (accessCodeMatch && accessCodeMatch.length > 1) this.accessCode = accessCodeMatch[1];
    this.user = {};
    this.handleChange = this.handleChange.bind(this);
    this.submitForm = this.submitForm.bind(this);
  }

  handleChange(e) {
    this.user[e.target.name] = e.target.value;
  }

  submitForm(e) {
    e.preventDefault();
    if (!this.props.disableForm) this.props.onSubmit(this.accessCode, this.user);
  }

  render() {
    return (
      <div className="card details-card">
        <img src={Config.organization.logo} />
        <p className="question" style={{ marginTop: '20px' }}>Enter a new password</p>
        <div className="inner">
          <form onSubmit={this.submitForm} autoComplete="off">
            <div className="password">
              <p className="text">
Password
                <span className="info">(at least 10 characters)</span>
              </p>
              <input type="password" className="input-large" name="newPassword" onChange={this.handleChange} />
            </div>
            <div className="password">
              <p className="text">
Confirm Password
                <span className="info">(at least 10 characters)</span>
              </p>
              <input type="password" className="input-large" name="confPassword" onChange={this.handleChange} />
            </div>
            <Button className="btn" loading={this.props.disableForm} style="blue" text="Reset Password" onClick={this.submitForm} />
          </form>
        </div>
      </div>
    );
  }
}
