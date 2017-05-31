import React from 'react';
import Config from 'config';

import DetailsCard from './detailsCard';
import NameConfirmCard from './nameConfirmCard';
import FacebookLoginCard from './facebookLoginCard'

const PAGE_FB_LOGIN = Symbol('PAGE_FB_LOGIN');
const PAGE_DETAILS_CARD = Symbol('PAGE_DETAILS_CARD');

export default class RegisterComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentPage: PAGE_FB_LOGIN,
            profile: {
                firstName: "",
                lastName: "",
                email: "",
                year: 0,
                major: "",
                password: "",
                confPassword: ""
            }
        }

        this.handleFacebookLogin = this.handleFacebookLogin.bind(this);
        this.handleProfileChange = this.handleProfileChange.bind(this);
        this.handleProfileSubmit = this.handleProfileSubmit.bind(this);
        this.profileValid = this.profileValid.bind(this);
        this.renderComponentForPage = this.renderComponentForPage.bind(this);
    }

    renderComponentForPage(page) {
        switch (page) {
            case PAGE_FB_LOGIN:
                return <FacebookLoginCard facebookCallback={this.handleFacebookLogin} />
            case PAGE_DETAILS_CARD:
                return <DetailsCard
                            profile={this.state.profile}
                            onChange={this.handleProfileChange}
                            onSubmit={this.handleProfileSubmit}
                            profileValid={this.profileValid} />
            default:
                return null
        }
    }

    handleFacebookLogin(response) {
        if (!response || !response.name || !response.id)
            return;

        this.setState({
            currentPage: PAGE_DETAILS_CARD,
            profile: {
                firstName: response.name.split(" ")[0],
                lastName: response.name.split(" ")[1],
                email: response.email
            }
        })
    }

    handleProfileChange(name, value) {
        this.setState(prev => {
            let newState = Object.assign({}, prev);
            newState.profile[name] = value;
            return newState;
        });
    }

    handleProfileSubmit() {
        if (!this.profileValid())
            return;
    }

    profileValid() {
        return this.state.profile.firstName && this.state.profile.lastName &&
               this.state.profile.email && this.state.profile.major && 
               parseInt(this.state.profile.year) !== NaN && parseInt(this.state.profile.year) > 0 &&
               this.state.profile.password && this.state.profile.password.length >= 8;
    }

    render() {
        return (
            <div className="register-component">
                <a href="/login" className="no-style Title-2White login-link">&lt; Back to Login</a>
                { this.renderComponentForPage(this.state.currentPage) }
                <img src={Config.organization.logoLight} className="corner-logo" />
            </div>
        );
    }
}