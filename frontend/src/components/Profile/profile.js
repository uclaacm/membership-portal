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

        this.state = {
            profile: Object.assign({}, this.props.profile),
            originalProfile: Object.assign({}, this.props.profile),
            showChangePassword: false
        };

        this.saveProfile = this.saveProfile.bind(this);
        this.handleUpdate = this.handleUpdate.bind(this);
        this.hideChangePassword = this.hideChangePassword.bind(this);
        this.showChangePassword = this.showChangePassword.bind(this);
    }

    handleUpdate(e) {
        let name = e.target.name;
        let value = e.target.value;
        this.setState(prev => {
            let newState = Object.assign({}, prev);
            newState.profile[name] = value;
            return newState;
        });
    }

    hideChangePassword(e) {
        this.setState(prev => Object.assign({}, prev, { showChangePassword: false }));
    }

    showChangePassword(e) {
        this.setState(prev => Object.assign({}, prev, { showChangePassword: true }));
    }

    profileUpdated() {
        return this.state.profile.name !== this.state.originalProfile.name ||
               parseInt(this.state.profile.year) !== parseInt(this.state.originalProfile.year) ||
               this.state.profile.major !== this.state.originalProfile.major;
    }

    saveProfile(e) {
        let nameArray = this.state.name.trim().replace(/\s{2,}/g, " ").split(' ');
        if (nameArray.length !== 2) {
            this.refs.banner.showBanner("Please enter a valid first and last name", false);
            return;
        }

        let firstName = nameArray[0];
        let lastName = nameArray[1];
        let year = this.state.year;
        let major = this.state.major;

        this.props.saveChanges({ firstName, lastName, year, major });
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            profile: Object.assign({}, this.props.profile),
            originalProfile: Object.assign({}, this.props.profile),
            showChangePassword: false
        });
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
                {/*<BannerMessage ref="banner" showing={this.props.updated} success={this.props.updateSuccess} message={this.props.updateSuccess ? "Profile successfully updated." : "An error occurred."} />*/}
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
                        <input type="text" className="Display-2Primary" value={this.state.profile.name} name="name" onChange={this.handleUpdate}/>
                        <span className="dummy" ref="name">{this.state.profile.name}</span>
                    </div>
                    <div className="form-elem">
                        <p className="SubheaderSecondary">You are a</p>
                        <YearSelector
                            target="year"
                            value={this.state.profile.year}
                            onChange={this.handleUpdate} />
                    </div>
                    <div className="form-elem">
                        <p className="SubheaderSecondary">majoring in</p>
                        <input type="text" className="Display-2Primary" value={this.state.profile.major} name="major" onChange={this.handleUpdate}/>
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
