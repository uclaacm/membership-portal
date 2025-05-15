import React from 'react';
import PropTypes from 'prop-types';
import Config from 'config';
import Button from 'components/Button';
import Logo from '../Login/logo';
import Banner from '../Login/banner';
import { NavLink } from 'react-router-dom';


export default class RegisterSidebar extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e) {
    const { onChange } = this.props;
    if (onChange) {
      onChange(e.target.name, e.target.value);
    }
  }

  render() {
    const { disableForm, onSubmit, profileValid } = this.props;
    
    return (
      <div className="login-sidebar">
        <div className='banner-container'>
          <Banner decorative={true} />
        </div>
        <div className="login-container">
          <Logo pic={'/assets/images/acm_wordmark_chapter.svg'} />
          <h1 className="login-title">Complete Registration</h1>

          <form onSubmit={onSubmit} autoComplete="off" className="register-form">
            <div className="form-group">
              <label className="form-label">Major</label>
              <select className="form-input" name="major" onChange={this.handleChange}>
                <option value="">--</option>
                {Config.majors.map(major => <option key={major} value={major}>{major}</option>)}
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">Year</label>
              <select className="form-input" name="year" onChange={this.handleChange}>
                <option value={0}>--</option>
                <option value={1}>Freshman</option>
                <option value={2}>Sophomore</option>
                <option value={3}>Junior</option>
                <option value={4}>Senior</option>
                <option value={5}>Post-Senior</option>
              </select>
            </div>
            
            <div className="form-button">
              <Button
                className="btn"
                loading={disableForm}
                style={profileValid() ? 'green' : 'disabled'}
                text="Complete Registration"
                onClick={onSubmit}
              />
            </div>
          </form>

          <NavLink className="back-btn"  to='/'>Back to login
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
              <path d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 73.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z"/>
            </svg>
          </NavLink>
        </div>
      </div>
    );
  }
}

RegisterSidebar.propTypes = {
  onChange: PropTypes.func.isRequired,
  disableForm: PropTypes.bool.isRequired,
  onSubmit: PropTypes.func.isRequired,
  profileValid: PropTypes.func.isRequired,
}; 