import React from 'react';
import Config from 'config';
import Button from 'components/Button';
import OverlayPopup from 'components/OverlayPopup';
import BannerMessage from 'components/BannerMessage';

import EditableSpan from './editableSpan';
import YearSelector from './yearSelector';

export default class Profile extends React.Component {
    constructor(props) {
        super(props);

        this.state = this.props.profile;
        this.state.showChangePassword = false;
        this.originalProfile = this.props.profile;

        this.saveProfile = this.saveProfile.bind(this);
        this.handleUpdate = this.handleUpdate.bind(this);
        this.hideChangePassword = this.hideChangePassword.bind(this);
        this.showChangePassword = this.showChangePassword.bind(this);
    }

    handleUpdate(obj) {
        let newObject = { };
        newObject[obj.target] = obj.value;
        this.setState(prev => Object.assign({}, prev, newObject));
    }

    hideChangePassword(e) {
        this.setState(prev => Object.assign({}, prev, { showChangePassword: false }));
    }

    showChangePassword(e) {
        this.setState(prev => Object.assign({}, prev, { showChangePassword: true }));
    }

    profileUpdated() {
        return this.state.name !== this.originalProfile.name ||
               this.state.year !== this.originalProfile.year ||
               this.state.major !== this.originalProfile.major;
    }

    saveProfile(e) {
        if (!this.profileUpdated())
            return;
        this.refs.banner.showBanner("Profile updated successfully.", true);
    }

    render() {
        if (this.props.error)
            return <div className="profile-wrapper"><h1>{this.props.error}</h1></div>;

        let nextLevel;
        for (let level of Config.levels) {
            if (level.startsAt > this.props.profile.points) {
                nextLevel = level;
                break;
            }
        }

        return (
            <div>
                <BannerMessage ref="banner" />
                <OverlayPopup
                    onCancel={ this.hideChangePassword }
                    onSubmit={ this.submitChangePassword }
                    showing={ this.state.showChangePassword }
                    title="Change Password"
                    submitText="Update"
                    cancelText="Cancel">
                    <form onSubmit={ this.submitChangePassword }>
                        <input type="password" placeholder="Old password..." /><br />
                        <input type="password" placeholder="New password..." /><br />
                        <input type="password" placeholder="Confirm password..." /><br />
                        { this.props.checkInError ? <span className="CaptionSecondary error">{ this.props.checkInError }</span> : <span className="CaptionSecondary error">&nbsp;</span> }
                    </form>
                </OverlayPopup>
                <div className="mobile-profile-head">

                </div>
                <div className="profile-wrapper">
                    <div className="form-elem">
                        <p className="SubheaderSecondary">Hello,</p>
                        <EditableSpan
                            target="name"
                            value={this.props.profile.name}
                            onChange={this.handleUpdate} />
                    </div>
                    <div className="form-elem">
                        <p className="SubheaderSecondary">You are a</p>
                        <YearSelector
                            target="year"
                            value={this.props.profile.year}
                            onChange={this.handleUpdate} />
                    </div>
                    <div className="form-elem">
                        <p className="SubheaderSecondary">majoring in</p>
                        <EditableSpan
                            target="major"
                            value={this.props.profile.major}
                            onChange={this.handleUpdate} />
                    </div>
                    <div className="form-elem">
                        <Button
                            className="profile-action-button"
                            style={ this.profileUpdated() ? "green" : "disabled" }
                            onClick= { this.saveProfile }
                            text="Save" />
                        <a href="/profile" className="no-style">
                            <Button
                                className="profile-action-button"
                                style={ this.profileUpdated() ? "red" : "disabled" }
                                text="Discard" />
                        </a>
                    </div>
                    
                    <div className="divider"></div>

                    <div className="form-elem">
                        <p className="SubheaderSecondary">Your current rank is</p>
                        <span className="Display-2Primary">Hacker</span>
                    </div>
                    <div className="form-elem">
                        <p className="SubheaderSecondary">You have <span className="Subheader-2Primary">{nextLevel.startsAt - this.props.profile.points}</span> more point(s) until you become a</p>
                        <span className="Display-2Primary">{nextLevel.rank}</span>
                    </div>

                    <div className="divider"></div>
                    <div className="form-elem">
                        <Button
                            className="profile-action-button"
                            style="blue"
                            text="Change Password"
                            onClick={this.showChangePassword} />
                    </div>
                </div>
            </div>
        );
    }
}