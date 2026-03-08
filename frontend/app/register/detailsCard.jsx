import React from 'react';
import Config from 'config';
import PropTypes from 'prop-types';
import Button from 'components/Button';

export default class DetailsCard extends React.Component {
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
      <div className={`card details-card${profileValid() ? ' confirm-details' : ''}`}>
        <img src={Config.organization.logo} alt="ACM logo" />
        <div className="inner">
          <form onSubmit={onSubmit} autoComplete="off">
            <p className="header">Account Details</p>

            <div className="align align-input-major">
              <p className="text">
                Major
                <span className="info">(choose one)</span>
              </p>
              <select className="input-major" name="major" onChange={this.handleChange}>
                <option value="">--</option>
                {Config.majors.map(major => <option value={major}>{major}</option>)}
              </select>
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
                <option value={5}>Post-Senior</option>
              </select>
            </div>
            <br />
            <Button
              className="btn"
              loading={disableForm}
              style={profileValid() ? 'green' : 'disabled'}
              text="Finish"
              onClick={onSubmit}
            />
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
  profileValid: PropTypes.func.isRequired,
};
