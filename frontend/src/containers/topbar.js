import React from 'react';
import {connect} from 'react-redux';

import {Action} from 'reducers';
import Topbar from 'components/Topbar';

class TopbarContainer extends React.Component {
	componentWillMount() {
		if (this.props.authenticated) {
			this.props.fetchUser();
		}
	}

	render() {
		return this.props.fetchSuccess && <Topbar isAdmin={this.props.isAdmin} />;
	}
}

const mapStateToProps = (state) => {
	if (state.User.get("fetchSuccess")) {
		return {
			fetchSuccess: true,
			authenticated: true,
			isAdmin: state.Auth.get('isAdmin')
		}
	} else {
		return {
			fetchSuccess: false,
			authenticated: state.Auth.get("authenticated"),
			isAdmin: state.Auth.get('isAdmin')
		}
	}
};

const mapDispatchToProps = dispatch => {
	return {
		fetchUser: () => {
			dispatch(Action.FetchUser());
		}
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(TopbarContainer);