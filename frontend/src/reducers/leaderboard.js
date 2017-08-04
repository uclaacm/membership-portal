import moment from 'moment';
import Config from 'config';
import Storage from 'storage';
import Immutable from 'immutable';

import { LogoutUser } from './auth';

//////////////////
//// ACTIONS /////
//////////////////

const FETCH_SUCCESS = Symbol('FETCH_SUCCESS');
const FETCH_ERR = Symbol('FETCH_ERR');
const INVALIDATE = Symbol('INVALIDATE');

const fetchSuccess = leaderboard => {
	return {
		type: FETCH_SUCCESS,
		time: Date.now(),
		leaderboard,
	};
};

const fetchError = error => {
	return {
		type: FETCH_ERR,
		error,
	};
};

const FetchLeaderboard = () => {
	return async dispatch => {
		try {
			const response = await fetch(Config.API_URL + Config.routes.leaderboard, {
				method: 'GET',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${Storage.get("token")}`
				}
			});

			const status = await response.status;

            if (status === 401 || status === 403) {
				return dispatch(LogoutUser());
			}

			const data = await response.json();

			if (!data)
				throw new Error("Empty response from server");
			if (data.error)
				throw new Error(data.error.message);

			dispatch(fetchSuccess(data.leaderboard));
		} catch(err){
			dispatch(fetchError(err.message));
		}
	};
};

const InvalidateLeaderboard = ()=>{
	return {
		type: INVALIDATE,
	};
};


///////////////
/// STATE /////
///////////////

const defaultState = Immutable.fromJS({
	leaderboard: [],
	error: '',
	fetched: false,
	fetchSuccess: false,
	fetchTime: 0,
});

//////////////////
//// REDUCERS ////
//////////////////

const Leaderboard = (state=defaultState, action) => {
	switch(action.type) {
		case FETCH_SUCCESS:
			return state.withMutations(val => {
				val.set('leaderboard', action.leaderboard);
				val.set('error', '');
				val.set('fetched', true);
				val.set('fetchSuccess', true);
				val.set('fetchTime', action.time);
			});

		case FETCH_ERR:
			return state.withMutations(val => {
				val.set('error', action.error);
				val.set('fetched', true);
				val.set('fetchSuccess', false);
			});

		case INVALIDATE:
			return state.withMutations(val => {
				val.set('fetchTime', 0);
			});


		default:
			return state;
	}
}

export {
	Leaderboard, FetchLeaderboard, InvalidateLeaderboard,
}
