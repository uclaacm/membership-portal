import Immutable from 'immutable';
import Config from 'config';
import {Action} from 'reducers';

const REGISTER_SUCCESS = Symbol('REGISTER_SUCCESS');
const REGISTER_ERR = Symbol('REGISTER_ERR');
const REGISTER_DONE = Symbol('REGISTER_DONE');

const registerSuccess = (user)=>{
	return {
		type: REGISTER_SUCCESS,
		user
	};
};

const registerErr = (error)=>{
	return {
		type: REGISTER_ERR,
		error
	};
}

const registerDone = () => {
	return {
		type: REGISTER_DONE
	};
}

const RegisterUser = newuser => {
	return async dispatch => {
		try {
			const response = await fetch(Config.API_URL + Config.routes.auth.register, {
				method: 'POST',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({'user': newuser}),
			});

			const status = await response.status;
			const data = await response.json();

			if (!data)
				throw new Error("Empty response from server");
			if (data.error)
				throw new Error(data.error.message);
			
			dispatch(registerSuccess(data.user));
			dispatch(Action.LoginUser(newuser.email, newuser.password));
		} catch(err) {
			dispatch(registerErr(err.message));
		}
	};
};

const defaultState = Immutable.fromJS({
	newuser: {},
	registered: false,
	registerSuccess: false,
	error: '',
});

const Registration = (state=defaultState, action) => {
	switch (action.type) {
		case REGISTER_SUCCESS:
			return state.withMutations(val => {
				val.set('registered', true);
				val.set('registerSuccess', true);
				val.set('error', '');
				val.set('newuser', action.user);
			});

		case REGISTER_ERR:
			return state.withMutations(val => {
				val.set('registered', true);
				val.set('registerSuccess', false);
				val.set('error', action.error);
			});
		
		case REGISTER_DONE:
			return state.withMutations(val => {
				val.set('registered', false);
			});

		default:
			return state;
	}
}

export {
	Registration, RegisterUser, registerDone
}