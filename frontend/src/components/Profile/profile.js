import React from 'react';
import Config from 'config';
import Button from 'components/Button';
import OverlayPopup from 'components/OverlayPopup';
import BannerMessage from 'components/BannerMessage';

import YearSelector from './yearSelector';
import MobileProfile from './mobileProfile';

export default class Profile extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            profile: Object.assign({}, this.props.profile),
            originalProfile: Object.assign({}, this.props.profile),
            password: '',
            passwordNew: '',
            passwordConf: '',
            showChangePassword: false
        };

        this.inputs = {};
        this.saveProfile = this.saveProfile.bind(this);
        this.handleUpdate = this.handleUpdate.bind(this);
        this.registerInput = this.registerInput.bind(this);
        this.resizeTextAreas = this.resizeTextAreas.bind(this);
        this.hideChangePassword = this.hideChangePassword.bind(this);
        this.showChangePassword = this.showChangePassword.bind(this);
        this.submitChangePassword = this.submitChangePassword.bind(this);
    }

    registerInput(input) {
        if (input && input.name)
            this.inputs[input.name] = input;
    }

    resizeTextAreas() {
        for (let input in this.inputs) {
            this.inputs[input].style.height = "auto";
            this.inputs[input].style.height = (this.inputs[input].scrollHeight) + "px";
        }
    }

    handleUpdate(e) {
        this.resizeTextAreas();
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

    submitChangePassword(e) {
        e.preventDefault();
        this.props.saveChanges({
            password: this.state.password,
            newPassword: this.state.passwordNew,
            confPassword: this.state.passwordConf,
        });
    }

    profileUpdated() {
        return parseInt(this.state.profile.year) !== parseInt(this.state.originalProfile.year) ||
               this.state.profile.name !== this.state.originalProfile.name ||
               this.state.profile.major !== this.state.originalProfile.major;
    }

    saveProfile(e) {
        let nameArray = this.state.profile.name.trim().replace(/\s{2,}/g, " ").split(' ');
        if (nameArray.length !== 2) {
            this.refs.banner.showBanner("Please enter a valid first and last name", false);
            return;
        }

        if (parseInt(this.state.profile.year) === NaN) {
            this.refs.banner.showBanner("Please select a valid year", false);
            return;
        }

        let firstName = nameArray[0].replace(/\n/g, '');
        let lastName = nameArray[1].replace(/\n/g, '');
        let year = this.state.profile.year;
        let major = this.state.profile.major.replace(/\n/g, '');

        this.props.saveChanges({ firstName, lastName, year, major });
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
            showChangePassword: false
        });

        this.resizeTextAreas();
    }

    render() {
        if (this.props.error)
            return <div className="profile-wrapper"><h1>{this.props.error}</h1></div>;

        let currLevel = Config.levels[0];
        let nextLevel = Config.levels[1];
        let currLevelNumber = 0;
        for (let i = 0; i < Config.levels.length; i++) {
            if (Config.levels[i].startsAt > this.props.points) {
                currLevel = Config.levels[i - 1];
                currLevelNumber = i - 1;
                nextLevel = Config.levels[i];
                break;
            }
        }

        return (
            <div>
                <BannerMessage
                    ref="banner"
                    showing={this.props.updated}
                    success={this.props.updateSuccess}
                    message={this.props.updateSuccess ? "Profile successfully updated." : this.props.updateError} />
                <OverlayPopup
                    onCancel={ this.hideChangePassword }
                    onSubmit={ this.submitChangePassword }
                    showing={ this.state.showChangePassword }
                    title="Change Password"
                    submitText="Update"
                    cancelText="Cancel">
                    <form onSubmit={this.submitChangePassword}>
                        <input type="password" placeholder="Old password..." onChange={(e)=>{let v = e.target.value;this.setState((prev)=>{
                            return Object.assign({}, prev, {password: v});
                          });}}/><br />
                        <input type="password" placeholder="New password..." onChange={(e)=>{let v = e.target.value; this.setState((prev)=>{
                            return Object.assign({}, prev, {passwordNew: v});
                          });}}/><br />
                        <input type="password" placeholder="Confirm password..." onChange={(e)=>{let v = e.target.value;this.setState((prev)=>{
                            return Object.assign({}, prev, {passwordConf: v});
                          });}}/><br />
                        { this.props.checkInError ? <span className="CaptionSecondary error">{ this.props.checkInError }</span> : <span className="CaptionSecondary error">&nbsp;</span> }
                    </form>
                </OverlayPopup>
                {/*<MobileProfile profile={this.props.profile} />*/}
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
                            value={this.state.profile.name} name="name" />
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
                        <textarea
                            rows="1"
                            name="major"
                            type="text"
                            className="Display-2Primary"
                            ref={this.registerInput}
                            value={this.state.profile.major} name="major"
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
                        <span className="Display-2Primary">{currLevel.rank}</span>
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
