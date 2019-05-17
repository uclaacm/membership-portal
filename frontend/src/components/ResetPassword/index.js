import React from 'react';
import Config from 'config';
import { NavLink } from 'react-router-dom';
import BannerMessage from 'components/BannerMessage';
import ReqResetPassCard from './requestResetPassCard';
import ReqResetPassSuccessCard from './requestResetPassSuccessCard';
import ResetPassCard from './resetPassCard';
import ResetPassSuccessCard from './resetPassSuccessCard';

const PAGE_REQ_RESET_PASS = Symbol();
const PAGE_REQ_RESET_PASS_SUCCESS = Symbol();
const PAGE_RESET_PASS = Symbol();
const PAGE_RESET_PASS_SUCCESS = Symbol();

export default class ResetPasswordComponent extends React.Component {
  constructor(props) {
    super(props);

    const accessCodeMatch = window.location.pathname.match(/resetpassword\/(.+)$/);
    this.state = {
      disableForm: false,
      currentPage: accessCodeMatch ? PAGE_RESET_PASS : PAGE_REQ_RESET_PASS,
    };

    this.requestResetPassword = this.requestResetPassword.bind(this);
    this.resetPassword = this.resetPassword.bind(this);
  }

  requestResetPassword(email) {
    this.setState(prev => Object.assign({}, prev, { disableForm: true }));
    this.props.requestResetPassword(email);
  }

  resetPassword(code, user) {
    this.setState(prev => Object.assign({}, prev, { disableForm: true }));
    this.props.resetPassword(code, user);
  }

  renderComponentForPage(page) {
    switch (page) {
      case PAGE_REQ_RESET_PASS:
        return <ReqResetPassCard disableForm={this.state.disableForm} onSubmit={this.requestResetPassword} />;
      case PAGE_REQ_RESET_PASS_SUCCESS:
        return <ReqResetPassSuccessCard />;
      case PAGE_RESET_PASS:
        return <ResetPassCard disableForm={this.state.disableForm} onSubmit={this.resetPassword} />;
      case PAGE_RESET_PASS_SUCCESS:
        return <ResetPassSuccessCard />;
      default:
        return null;
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState((prev) => {
      const newState = Object.assign({}, prev);
      if (prev.currentPage === PAGE_REQ_RESET_PASS && nextProps.didRequestResetPassword && !nextProps.error) newState.currentPage = PAGE_REQ_RESET_PASS_SUCCESS;
      if (prev.currentPage === PAGE_RESET_PASS && nextProps.didResetPassword && !nextProps.error) newState.currentPage = PAGE_RESET_PASS_SUCCESS;
      newState.disableForm = false;
      return newState;
    });
  }

  render() {
    return (
      <div>
        <BannerMessage showing={this.props.showBanner} success={false} message={this.props.error} />
        <div className="reset-pass-component">
          <NavLink to="/login" className="no-style Title-2White login-link">
            <i className="fa fa-chevron-left" aria-hidden="true" />
&nbsp; Back to Login
          </NavLink>
          { this.renderComponentForPage(this.state.currentPage) }
          <img src={Config.organization.logoLight} className="corner-logo" />
        </div>
      </div>
    );
  }
}
