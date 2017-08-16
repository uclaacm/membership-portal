import React from 'react';
import Config from 'config';
import { NavLink } from 'react-router-dom';
import BannerMessage from 'components/BannerMessage';

import DetailsCard from './detailsCard';
import SuccessCard from './successCard';
import FacebookLoginCard from './facebookLoginCard';

const PAGE_FB_LOGIN = Symbol();
const PAGE_DETAILS_CARD = Symbol();
const PAGE_SUCCESS_CARD = Symbol();

export default class RegisterComponent extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			currentPage: PAGE_FB_LOGIN,
			disableForm: false,
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
							disableForm={this.state.disableForm}
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
		if (!this.state.disableForm) {
			if (!this.profileValid())
				return;
			this.setState(prev => Object.assign({}, prev, { disableForm: true }));
			this.props.createUser(this.state.profile);
		}
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

	componentWillReceiveProps(nextProps) {
		if (nextProps.created && nextProps.createSuccess) {
			this.setState(prev => {
				let newState = Object.assign({}, prev);
				newState.currentPage = PAGE_SUCCESS_CARD;
				newState.disableForm = false;
				return newState;
			});
		} else {
			this.setState(prev => Object.assign({}, prev, { disableForm: false }));
		}
	}

	render() {
		return (
			<div>
				<BannerMessage showing={this.props.created && !this.props.createSuccess} success={false} message={this.props.createError} />
				<div className="register-component">
					<NavLink to="/login" className="no-style Title-2White login-link"><i className="fa fa-chevron-left" aria-hidden="true"></i>&nbsp; Back to Login</NavLink>
					{ this.renderComponentForPage(this.state.currentPage) }
					<img src={Config.organization.logoLight} className="corner-logo" />
				</div>
			</div>
		);
	}
}