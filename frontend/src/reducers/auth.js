import Config from 'config';
import Storage from 'storage';
import Immutable from 'immutable';

import { replace } from 'react-router-redux';

/**********************************************
 ** Constants                                **
 *********************************************/

const AUTH_USER = Symbol();
const UNAUTH_USER = Symbol();
const AUTH_ERROR = Symbol();

const REQUEST_PASSWORD_RESET_SUCCESS = Symbol();
const REQUEST_PASSWORD_RESET_ERROR = Symbol();

const RESET_PASSWORD_SUCCESS = Symbol();
const RESET_PASSWORD_ERROR = Symbol();
const RESET_PASSWORD_DONE = Symbol();

const initState = () => {
	const token = Storage.get('token');
	return Immutable.fromJS({
		error: null,
		timestamp: null,
		authenticated: !!token,
		isAdmin: !!token && tokenIsAdmin(token),

		requestedResetPassword: false,
		resetPassword: false,
	});
}

/**********************************************
 ** Helper Functions                         **
 *********************************************/

const tokenGetClaims = token => {
	if (!token) {
		return {};
	}
	const tokenArray = token.split('.');
	if(tokenArray.length !== 3){
		return {};
	}
	return JSON.parse(window.atob(tokenArray[1].replace('-', '+').replace('_', '/')));
};

const tokenIsAdmin = token => !!tokenGetClaims(token).admin;

/**********************************************
 ** Auth States                              **
 *********************************************/

class State {
	static Auth(error, token) {
		return {
			type    : error ? AUTH_ERROR : AUTH_USER,
			isAdmin : error ? undefined : tokenIsAdmin(token),
			error   : error || undefined,
		};
	}
	static UnAuth(error) {
		return {
			type: UNAUTH_USER,
		};
	}
	static RequestResetPassword(error) {
		return {
			type  : error ? REQUEST_PASSWORD_RESET_ERROR : REQUEST_PASSWORD_RESET_SUCCESS,
			error : error || undefined,
		};
	}
	static ResetPassword(error) {
		return {
			type  : error ? RESET_PASSWORD_ERROR : RESET_PASSWORD_SUCCESS,
			error : error || undefined,
		};
	}
}

/**********************************************
 ** Actions                                  **
 *********************************************/

const LoginUser = (email, password) => {
	return async (dispatch) => {
		try {
			const response = await fetch(Config.API_URL + Config.routes.auth.login, {
				method: 'POST',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ email, password }),
			});

			const status = await response.status;
			const data = await response.json();

			if (!data)
				throw new Error('Empty response from server');
			if (data.error)
				throw new Error(data.error.message);

			Storage.set('token', data.token);
			dispatch(State.Auth(null, data.token));
		} catch (err) {
			dispatch(State.Auth(err.message));
		}
	};
}

const LogoutUser = (error) => {
	return async (dispatch) => {
		dispatch(State.UnAuth());
		Storage.remove('token');
		dispatch(replace('/login'));
	}
}

const RequestResetPassword = email => {
	return async dispatch => {
		try {
			const response = await fetch(Config.API_URL + Config.routes.auth.resetPassword + `/${email}`, {
				method: 'GET',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				}
			});

			const status = await response.status;
			const data = await response.json();

			if (!data)
				throw new Error('Empty response from server');
			if (data.error)
				throw new Error(data.error.message);

			dispatch(State.RequestResetPassword());
		} catch (err) {
			dispatch(State.RequestResetPassword(err));
		}
	};
}

const ResetPassword = (code, user) => {
	return async dispatch => {
		try {
			const response = await fetch(Config.API_URL + Config.routes.auth.resetPassword + `/${code}`, {
				method: 'POST',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ user })
			});

			const status = await response.status;
			const data = await response.json();

			if (!data)
				throw new Error('Empty response from server');
			if (data.error)
				throw new Error(data.error.message);

			dispatch(State.ResetPassword());
		} catch (err) {
			dispatch(State.ResetPassword(err));
		}
	};
}

/**********************************************
 ** Auth Reducer                             **
 *********************************************/

const Auth = (state=initState(), action) => {
	switch (action.type) {
		case AUTH_USER:
			return state.withMutations(val => {
				val.set('error', null);
				val.set('timestamp', Date.now());
				val.set('authenticated', true);
				val.set('isAdmin', action.isAdmin);
			});

		case UNAUTH_USER:
			return state.withMutations(val => {
				val.set('authenticated', false);
				val.set('isAdmin', false);
			});

		case AUTH_ERROR:
			return state.withMutations(val => {
				val.set('error', action.error);
				val.set('timestamp', Date.now());
			});

		case REQUEST_PASSWORD_RESET_SUCCESS:
			return state.withMutations(val => {
				val.set('error', null);
				val.set('resetPassword', false);
				val.set('requestedResetPassword', true);
			});

		case REQUEST_PASSWORD_RESET_ERROR:
			return state.withMutations(val => {
				val.set('error', action.error);
				val.set('resetPassword', false);
				val.set('requestedResetPassword', true);
			});

		case RESET_PASSWORD_SUCCESS:
			return state.withMutations(val => {
				val.set('error', null);
				val.set('resetPassword', true);
				val.set('requestedResetPassword', false);
			});

		case RESET_PASSWORD_ERROR:
			return state.withMutations(val => {
				val.set('error', action.error);
				val.set('resetPassword', true);
				val.set('requestedResetPassword', false);
			});

		case RESET_PASSWORD_DONE:
			return state.withMutations(val => {
				val.set('error', null);
				val.set('resetPassword', false);
				val.set('requestedResetPassword', false);
			});

		default:
			return state;
	}
}

const ResetPasswordDone = () => ({ type: RESET_PASSWORD_DONE });
export {
	Auth, LoginUser, LogoutUser, RequestResetPassword, ResetPassword, ResetPasswordDone
}
