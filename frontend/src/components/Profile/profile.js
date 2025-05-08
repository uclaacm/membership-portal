import React from "react";
import Utils from "utils";
import Button from "components/Button";
import BannerMessage from "components/BannerMessage";
import Config from "config";

import Activities from "./activities";
import YearSelector from "./yearSelector";
import MobileProfile from "./mobileProfile";

export default class Profile extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      profile: Object.assign({}, this.props.profile),
      originalProfile: Object.assign({}, this.props.profile),
    };

    this.inputs = {};
    this.saveProfile = this.saveProfile.bind(this);
    this.handleUpdate = this.handleUpdate.bind(this);
    this.registerInput = this.registerInput.bind(this);
    this.resizeTextAreas = this.resizeTextAreas.bind(this);
  }

  registerInput(input) {
    if (input && input.name) this.inputs[input.name] = input;
  }

  resizeTextAreas() {
    for (const input in this.inputs) {
      this.inputs[input].style.height = "auto";
      this.inputs[input].style.height = `${this.inputs[input].scrollHeight}px`;
    }
  }

  handleUpdate(e) {
    this.resizeTextAreas();
    const name = e.target.name;
    const value = e.target.value;
    this.setState(prev => {
      const newState = Object.assign({}, prev);
      newState.profile[name] = value;
      return newState;
    });
  }

  profileUpdated() {
    return (
      parseInt(this.state.profile.year) !== parseInt(this.state.originalProfile.year) ||
      this.state.profile.name !== this.state.originalProfile.name ||
      this.state.profile.major !== this.state.originalProfile.major
    );
  }

  saveProfile(e) {
    const nameArray = this.state.profile.name
      .trim()
      .replace(/\s{2,}/g, " ")
      .split(" ");
    if (nameArray.length !== 2) {
      this.refs.banner.showBanner("Please enter a valid first and last name", false);
      return;
    }

    if (parseInt(this.state.profile.year) === NaN) {
      this.refs.banner.showBanner("Please select a valid year", false);
      return;
    }

    const firstName = nameArray[0].replace(/\n/g, "");
    const lastName = nameArray[1].replace(/\n/g, "");
    const year = this.state.profile.year;
    const major = this.state.profile.major.replace(/\n/g, "");

    this.props.saveChanges({
      firstName,
      lastName,
      year,
      major,
    });
  }

  componentWillMount() {
    this.resizeTextAreas();
  }

  componentDidMount() {
    window.addEventListener("resize", this.resizeTextAreas);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.resizeTextAreas);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      profile: Object.assign({}, nextProps.profile),
      originalProfile: Object.assign({}, nextProps.profile),
    });

    this.resizeTextAreas();
  }

  render() {
    if (this.props.error)
      return (
        <div className="profile-wrapper">
          <h1>{this.props.error}</h1>
        </div>
      );

    const { currLevel, nextLevel } = Utils.getLevel(this.props.profile.points);
    const { adminView, toggleAdminView, isAdmin } = this.props
    return (
      <div>
        <BannerMessage
          ref="banner"
          showing={this.props.updated}
          success={this.props.updateSuccess}
          message={this.props.updateSuccess ? "Profile successfully updated." : this.props.updateError}
        />
        {/* <MobileProfile profile={this.props.profile} /> */}
        <div className="profile-wrapper">
          <div className="form-elem">
            <p className="SubheaderSecondary">Hello,</p>
            <textarea
              rows="1"
              type="text"
              name="name"
              className="Display-2Primary"
              ref={this.registerInput}
              onChange={this.handleUpdate}
              value={this.state.profile.name}
            />
          </div>
          <div className="form-elem">
            <p className="SubheaderSecondary">You are a</p>
            <YearSelector target="year" value={this.state.profile.year} onChange={this.handleUpdate} />
          </div>
          <div className="form-elem">
            <p className="SubheaderSecondary">majoring in</p>
            <select className="Display-2Primary" name="major" onChange={this.handleUpdate} value={this.state.profile.major}>
              {Config.majors.map((major) =>
                <option value={major}>{major}</option>
              )}
            </select>
          </div>
          <div className="form-elem">
            <Button
              className="profile-action-button"
              style={this.profileUpdated() ? "green" : "disabled"}
              onClick={this.profileUpdated() ? this.saveProfile : null}
              text="Save"
            />
            <Button
              className="profile-action-button"
              style={this.profileUpdated() ? "red" : "disabled"}
              onClick={this.profileUpdated() ? () => location.reload() : null}
              text="Discard"
            />
          </div>

          <div className="divider" />

          <div className="form-elem">
            <p className="SubheaderSecondary">Your current rank is</p>
            <span className="Display-2Primary">{currLevel.rank}</span>
          </div>
          {nextLevel ? (
            <div className="form-elem">
              <p className="SubheaderSecondary">
                You have
                <span className="Subheader-2Primary">{nextLevel.startsAt - this.props.profile.points}</span> more
                point(s) until you become a
              </p>
              <span className="Display-2Primary">{nextLevel.rank}</span>
            </div>
          ) : (
            <div className="form-elem">
              <p className="SubheaderSecondary">You are at the max rank. Congratulations!</p>
            </div>
          )}

          <div className="divider" />
          <div className="form-elem">
            <Button className="profile-action-button" style="red" text="Sign Out" onClick={this.props.logout} />
            {isAdmin && <Button
            className="control-panel-action-button"
            color="blue"
            text={adminView ? "Switch to Member View" : "Switch to Admin View"}
            onClick={toggleAdminView}
          /> }
          </div>

          <div className="divider" />
          <h1 className="Display-2Primary">Your Activity</h1>
          {!this.props.activityError && <Activities activities={this.props.activity} />}
          {this.props.activityError && <p className="activity-error">{this.props.activityError}</p>}
        </div>
      </div>
    );
  }
}
