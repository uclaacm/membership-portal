import React from 'react';
import {connect} from 'react-redux';
import {replace} from 'react-router-redux';

export default function (ComposedComponent) {
	class Authentication extends React.Component {
		componentWillMount() {
			if (!this.props.authenticated) {
				this.props.redirectLogin();
			}
		}

		componentWillUpdate(nextProps) {
			if (!nextProps.authenticated) {
				this.props.redirectLogin();
			}
		}

		render() {
			return <ComposedComponent {...this.props} />;
		}
	}

	const mapStateToProps = (state) => {
		return {
			authenticated: state.Auth.get("authenticated"),
		}
	}

	const mapDispatchToProps = (dispatch) => {
		return {
			redirectLogin: () => {
				dispatch(replace('/login'));
			}
		}
	}

	return connect(mapStateToProps, mapDispatchToProps)(Authentication);
}