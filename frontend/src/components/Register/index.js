import React from 'react';
import Config from 'config';
import { NavLink } from 'react-router-dom';
import BannerMessage from 'components/BannerMessage';

import NameCard from './nameCard';
import DetailsCard from './detailsCard';
import SuccessCard from './successCard';
import GoogleLoginCard from './googleLoginCard';

const PAGE_NAME_CARD = Symbol('Name Card');
const PAGE_DETAILS_CARD = Symbol('Details Card');
const PAGE_SUCCESS_CARD = Symbol('Success Card');
const PAGE_GOOGLE_LOGIN = Symbol('Google Login');

export default class RegisterComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentPage: PAGE_GOOGLE_LOGIN,
      disableForm: false,
      profile: {
        firstName: '',
        lastName: '',
        email: '',
        year: 0,
        major: '',
        password: '',
        profileId: '',
      },
    };

    this.nameValid = this.nameValid.bind(this);
    this.profileValid = this.profileValid.bind(this);
    this.skipGoogleLogin = this.skipGoogleLogin.bind(this);
    this.handleGoogleLogin = this.handleGoogleLogin.bind(this)
    this.handleProfileChange = this.handleProfileChange.bind(this);
    this.handleProfileSubmit = this.handleProfileSubmit.bind(this);
    this.handleNameEntryComplete = this.handleNameEntryComplete.bind(this);
    this.renderComponentForPage = this.renderComponentForPage.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.created && nextProps.createSuccess) {
      this.setState((prev) => {
        const newState = Object.assign({}, prev);
        newState.currentPage = PAGE_SUCCESS_CARD;
        newState.disableForm = false;
        return newState;
      });
    } else {
      this.setState(prev => Object.assign({}, prev, { disableForm: false }));
    }
  }

  skipGoogleLogin(e) {
    e.preventDefault();
    this.setState(prev => Object.assign({}, prev, { currentPage: PAGE_NAME_CARD }));
  }

  handleGoogleLogin(response) {
    if (!response || !response.profileObj || !response.profileObj.givenName
      || !response.profileObj.familyName) return;

    this.setState({
      currentPage: PAGE_DETAILS_CARD,
      profile: {
        firstName: response.profileObj.givenName,
        lastName: response.profileObj.familyName,
        profileId: response.googleId,
      },
    });
  }

  handleNameEntryComplete(e) {
    e.preventDefault();
    const { disableForm } = this.state;
    if (!disableForm) {
      if (!this.nameValid()) return;
      this.setState(prev => Object.assign({}, prev, { currentPage: PAGE_DETAILS_CARD }));
    }
  }

  handleProfileChange(name, value) {
    this.setState((prev) => {
      const newState = Object.assign({}, prev);
      newState.profile[name] = value;
      return newState;
    });
  }

  handleProfileSubmit(e) {
    const { disableForm, profile } = this.state;
    e.preventDefault();
    if (!disableForm) {
      if (!this.profileValid()) {
        return;
      }
      this.setState(prev => Object.assign({}, prev, { disableForm: true }));
      this.props.createUser(profile);
    }
  }

  profileValid() {
    const { profile } = this.state;
    const p = profile;
    return p.firstName
    && p.lastName
    && p.major
    && p.email
    && /^.{2,}@([^.@]{1,}\.)*ucla\.edu$/.test(p.email)
    && !Number.isNaN(parseInt(p.year, 10)) && parseInt(p.year, 10) > 0
    && p.password && p.password.length >= 10;
  }

  nameValid() {
    const { profile: { firstName, lastName } } = this.state;
    return firstName && lastName;
  }

  renderComponentForPage(page) {
    const { profile, disableForm } = this.state;
    switch (page) {
      case PAGE_GOOGLE_LOGIN:
        return (
          <GoogleLoginCard
            googleCallback={this.handleGoogleLogin}
            skipGoogleLogin={this.skipGoogleLogin}
          />
        );
      case PAGE_NAME_CARD:
        return (
          <NameCard
            onChange={this.handleProfileChange}
            onSubmit={this.handleNameEntryComplete}
            profileValid={this.nameValid}
          />
        );
      case PAGE_DETAILS_CARD:
        return (
          <DetailsCard
            profile={profile}
            onChange={this.handleProfileChange}
            onSubmit={this.handleProfileSubmit}
            disableForm={disableForm}
            profileValid={this.profileValid}
          />
        );
      case PAGE_SUCCESS_CARD:
        return <SuccessCard />;
      default:
        return null;
    }
  }

  render() {
    const { currentPage } = this.state;
    const { created, createSuccess, createError } = this.props;
    return (
      <div>
        <BannerMessage
          showing={created && !createSuccess}
          success={false}
          message={createError}
        />
        <div className="register-component">
          <NavLink to="/login" className="no-style Title-2White login-link">
            <i className="fa fa-chevron-left" aria-hidden="true" />
&nbsp; Back to Login
          </NavLink>
          { this.renderComponentForPage(currentPage) }
          <img src={Config.organization.logoLight} alt="logo light" className="corner-logo" />
        </div>
      </div>
    );
  }
}
