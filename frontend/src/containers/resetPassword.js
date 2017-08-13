import React from 'react';
import {connect} from 'react-redux';
import {Action} from 'reducers';
import ResetPasswordComponent from 'components/ResetPassword';

class ResetPassword extends React.Component {
	constructor(props) {
		super(props);
		this.requestResetPassword = this.requestResetPassword.bind(this);
		this.resetPassword = this.resetPassword.bind(this);
	}

	requestResetPassword(email) {
		this.props.requestResetPassword(email);
	}

	resetPassword(code, user) {
		this.props.resetPassword(code, user);
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.didRequestResetPassword || nextProps.didResetPassword) {
			setTimeout(() => {
				this.props.resetPasswordDone();
			}, 1000);
		}
	}

	render() {
		return <ResetPasswordComponent showBanner={!!this.props.error && (this.props.requestedResetPassword || this.props.resetPassword)}
		                               didRequestResetPassword={this.props.didRequestResetPassword}
																	 didResetPassword={this.props.didResetPassword}
		                               requestResetPassword={this.requestResetPassword} 
																	 resetPassword={this.resetPassword}
																	 error={this.props.error} />;
	}
}

const mapStateToProps = state => {
	return {
		didRequestResetPassword: state.Auth.get('requestedResetPassword'),
		didResetPassword: state.Auth.get('resetPassword'),
		error: state.Auth.get('error'),
	}
};

const mapDispatchToProps = dispatch => {
	return {
		requestResetPassword: email => dispatch(Action.RequestResetPassword(email)),
		resetPassword: (code, user) => dispatch(Action.ResetPassword(code, user)),

		resetPasswordDone: () => dispatch(Action.ResetPasswordDone()),
	}
};

export default connect(mapStateToProps, mapDispatchToProps)(ResetPassword);