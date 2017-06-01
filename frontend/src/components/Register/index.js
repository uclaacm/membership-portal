import React from 'react';
import Config from 'config';
import BannerMessage from 'components/BannerMessage';

import DetailsCard from './detailsCard';
import SuccessCard from './successCard';
import FacebookLoginCard from './facebookLoginCard';

const PAGE_FB_LOGIN = Symbol('PAGE_FB_LOGIN');
const PAGE_DETAILS_CARD = Symbol('PAGE_DETAILS_CARD');
const PAGE_SUCCESS_CARD = Symbol('PAGE_SUCCESS_CARD');

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
                profileId: ""
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
            case PAGE_SUCCESS_CARD:
                return <SuccessCard />
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
                profileId: response.id
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

    handleProfileSubmit(e) {
        e.preventDefault();
        if (!this.profileValid())
            return;
    }

    profileValid() {
        const p = this.state.profile;
        return p.firstName
            && p.lastName
            && p.major
            && p.email
            && /^.{2,}\@([^\.\@]{1,}\.)*ucla\.edu$/.test(p.email)
            && parseInt(p.year) !== NaN && parseInt(p.year) > 0
            && p.password && p.password.length >= 10;
    }

    render() {
        return (
            <div>
                <BannerMessage showing={this.props.created && !this.props.createSuccess} success={false} message={this.props.createError} />
                <div className="register-component">
                    <a href="/login" className="no-style Title-2White login-link">&lt; Back to Login</a>
                    { this.renderComponentForPage(this.state.currentPage) }
                    <img src={Config.organization.logoLight} className="corner-logo" />
                </div>
            </div>
        );
    }
}