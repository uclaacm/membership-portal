import React from 'react';
import {connect} from 'react-redux';
import {replace} from 'react-router-redux';

import {Action} from 'reducers';
import ControlPanelComponent from 'components/ControlPanel';

import moment from 'moment';

class ControlPanel extends React.Component {
	constructor(props) {
		super(props);
	}

	componentWillMount() {
		if (!this.props.isAdmin) {
			return this.props.redirectHome();
		}
	}

	componentWillReceiveProps(nextProps) {
		if (!nextProps.isAdmin) {
			return nextProps.redirectHome();
		}
	}

	render() {
		return <ControlPanelComponent />;
	}
}

const mapStateToProps = (state)=>{
	let profile = { name: "", major: "", year: 0, points: 0};

	if (state.User.get("fetchSuccess")) {
		const User = state.User.get("profile");
		profile.name = `${User.firstName} ${User.lastName}`;
		profile.major = User.major;
		profile.year = User.year;
		profile.points = User.points;
	}

	return {
		profile,
		authenticated: state.Auth.get("authenticated"),
		isAdmin: state.Auth.get('isAdmin'),
	};
};

const mapDispatchToProps = (dispatch)=>{
	return {
		redirectHome: () => {
			dispatch(replace('/'));
		},
		logout: () => {
			dispatch(Action.LogoutUser());
		},
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(ControlPanel);
