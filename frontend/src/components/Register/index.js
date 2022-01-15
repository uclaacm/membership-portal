import React from 'react';
import Config from 'config';
import BannerMessage from 'components/BannerMessage';

import DetailsCard from './detailsCard';
import SuccessCard from './successCard';

const PAGE_DETAILS_CARD = Symbol('Details Card');
const PAGE_SUCCESS_CARD = Symbol('Success Card');

export default class RegisterComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentPage: PAGE_DETAILS_CARD,
      disableForm: false,
      profile: {
        year: 0,
        major: '',
      },
    };

    this.profileValid = this.profileValid.bind(this);
    this.handleProfileChange = this.handleProfileChange.bind(this);
    this.handleProfileSubmit = this.handleProfileSubmit.bind(this);
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
    return !!(p.major
    && !Number.isNaN(parseInt(p.year, 10)) && parseInt(p.year, 10) > 0);
  }

  renderComponentForPage(page) {
    const { profile, disableForm } = this.state;
    switch (page) {
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
          { this.renderComponentForPage(currentPage) }
          <img src={Config.organization.logoLight} alt="logo light" className="corner-logo" />
        </div>
      </div>
    );
  }
}
