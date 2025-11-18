import React from 'react';
import Utils from 'utils';
import Button from 'components/Button';
import BannerMessage from 'components/BannerMessage';
import Config from 'config';

import Activities from './activities';
import YearSelector from './yearSelector';
import ProfileCard from './ProfileCard';

export default class Profile extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      profile: Object.assign({}, this.props.profile),
      originalProfile: Object.assign({}, this.props.profile),
    };

    this.saveProfile = this.saveProfile.bind(this);
    this.handleUpdate = this.handleUpdate.bind(this);
  }

  handleUpdate(e) {
    const { name } = e.target;
    const { value } = e.target;
    this.setState((prev) => {
      const newState = Object.assign({}, prev);
      newState.profile[name] = value;
      return newState;
    });
  }

  profileUpdated() {
    return (
      parseInt(this.state.profile.year) !== parseInt(this.state.originalProfile.year)
      || this.state.profile.name !== this.state.originalProfile.name
      || this.state.profile.major !== this.state.originalProfile.major
    );
  }

  saveProfile(e) {
    const nameArray = this.state.profile.name
      .trim()
      .replace(/\s{2,}/g, ' ')
      .split(' ');
    if (nameArray.length !== 2) {
      this.refs.banner.showBanner('Please enter a valid first and last name', false);
      return;
    }

    if (parseInt(this.state.profile.year) === NaN) {
      this.refs.banner.showBanner('Please select a valid year', false);
      return;
    }

    const firstName = nameArray[0].replace(/\n/g, '');
    const lastName = nameArray[1].replace(/\n/g, '');
    const { year } = this.state.profile;
    const major = this.state.profile.major.replace(/\n/g, '');

    this.props.saveChanges({
      firstName,
      lastName,
      year,
      major,
    });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      profile: Object.assign({}, nextProps.profile),
      originalProfile: Object.assign({}, nextProps.profile),
    });
  }

  render() {
    if (this.props.error) {
      return (
        <div className="profile-wrapper">
          <h1>{this.props.error}</h1>
        </div>
      );
    }

    const { adminView, toggleAdminView, isAdmin } = this.props;

    return (
      <div>
        <BannerMessage
          ref="banner"
          showing={this.props.updated}
          success={this.props.updateSuccess}
          message={this.props.updateSuccess ? 'Profile successfully updated.' : this.props.updateError}
        />

        <div className="profile-page-container">
          {/* Left Side: Editable Profile Info & Activity */}
          <div className="profile-content">
            <h1 className="profile-heading">My Profile</h1>

            <div className="profile-edit-section">
              <h2 className="section-title">Basic Information</h2>

              <div className="form-elem">
                <label className="SubheaderSecondary">Full Name</label>
                <textarea
                  rows="1"
                  type="text"
                  name="name"
                  className="profile-input"
                  onChange={this.handleUpdate}
                  value={this.state.profile.name}
                  placeholder="First Last"
                />
              </div>

              <div className="form-elem">
                <label className="SubheaderSecondary">Year</label>
                <YearSelector target="year" value={this.state.profile.year} onChange={this.handleUpdate} />
              </div>

              <div className="form-elem">
                <label className="SubheaderSecondary">Major</label>
                <select
                  className="profile-select"
                  name="major"
                  onChange={this.handleUpdate}
                  value={this.state.profile.major}
                >
                  {Config.majors.map((major, idx) => <option key={idx} value={major}>{major}</option>)}
                </select>
              </div>

              {this.profileUpdated() && (
                <div className="form-actions">
                  <Button
                    className="profile-action-button"
                    style="green"
                    onClick={this.saveProfile}
                    text="Save Changes"
                  />
                  <Button
                    className="profile-action-button"
                    style="red"
                    onClick={() => location.reload()}
                    text="Discard"
                  />
                </div>
              )}
            </div>

            <div className="divider" />

            <div className="activity-section">
              <h2 className="section-title">Your Activity</h2>
              {!this.props.activityError && <Activities activities={this.props.activity} />}
              {this.props.activityError && <p className="activity-error">{this.props.activityError}</p>}
            </div>
          </div>

          {/* Right Side: Profile Card */}
          <div className="profile-sidebar">
            <ProfileCard
              profile={this.props.profile}
              isAdmin={isAdmin}
              activity={this.props.activity}
            />
          </div>
        </div>
      </div>
    );
  }
}
