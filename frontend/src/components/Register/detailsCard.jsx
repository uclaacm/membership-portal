import React from 'react';
import Config from 'config';
import PropTypes from 'prop-types';
import Button from 'components/Button';

export default class DetailsCard extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    this.handleFocus = this.handleFocus.bind(this);
    this.state = {
      passwordLength: 0,
      passwordValid: true,
    };
  }

  handleChange(e) {
    const { onChange } = this.props;
    if (onChange) {
      onChange(e.target.name, e.target.value);
      const changed = e.target.name;
      const changedLength = e.target.value.length;
      if (changed === 'password') {
        this.setState({
          passwordLength: changedLength,
        });
      }
    }
  }

  handleBlur() {
    const { passwordLength } = this.state;
    this.setState({
      passwordValid: passwordLength >= 10,
    });
  }

  handleFocus() {
    this.setState({
      passwordValid: true,
    });
  }


  render() {
    const { passwordValid } = this.state;
    const {
      disableForm, onSubmit, profileValid,
    } = this.props;
    return (
      <div className={`card details-card${profileValid() ? ' confirm-details' : ''}`}>
        <img src={Config.organization.logo} alt="ACM logo" />
        <div className="inner">
          <form onSubmit={onSubmit} autoComplete="off">
            <p className="header">Account Details</p>

            <div className="email">
              <p className="text">
School Email
                <span className="info">(@ucla.edu)</span>
              </p>
              <input type="text" className="input-large" name="email" onChange={this.handleChange} />
            </div>
            <div className="password">
              <p className={passwordValid ? 'text' : 'text invalid'}>
Password
                <span className="info">(at least 10 characters)</span>
              </p>
              <input
                type="password"
                className={passwordValid ? 'input-large' : 'input-invalid'}
                name="password"
                onChange={this.handleChange}
                onBlur={this.handleBlur}
                onFocus={this.handleFocus}
              />
            </div>
            <div className="align align-input-major">
              <p className="text">
Major
                <span className="info">(full name of major)</span>
              </p>
              <input className="input-major" name="major" onChange={this.handleChange} />
            </div>
            <div className="align">
              <p className="text">
Year
                <span className="info">(choose one)</span>
              </p>
              <select className="input-year" name="year" onChange={this.handleChange}>
                <option value={0}>--</option>
                <option value={1}>Freshman</option>
                <option value={2}>Sophomore</option>
                <option value={3}>Junior</option>
                <option value={4}>Senior</option>
                <option value={5}>Post-senior</option>
              </select>
            </div>
            <br />
            <Button className="btn" loading={disableForm} style={profileValid() ? 'green' : 'disabled'} text="Finish" onClick={onSubmit} />
          </form>
        </div>
      </div>
    );
  }
}

DetailsCard.propTypes = {
  onChange: PropTypes.func.isRequired,
  disableForm: PropTypes.bool.isRequired,
  onSubmit: PropTypes.func.isRequired,
  profileValid: PropTypes.bool.isRequired,
};
