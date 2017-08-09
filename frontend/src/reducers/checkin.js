import Config from 'config';
import Storage from 'storage';
import Immutable from 'immutable';
import {Action} from 'reducers';

/**********************************************
 ** Constants                                **
 *********************************************/

const CHECK_IN_SUCCESS = Symbol('CHECK_IN_SUCCESS');
const CHECK_IN_ERROR = Symbol('CHECK_IN_ERROR');
const CHECK_IN_RESET = Symbol('CHECK_IN_RESET');

const defaultState = Immutable.fromJS({
	submitted: false,
	success: false,
	numPoints: 0,
	error: null,
});

/**********************************************
 ** Check In States                          **
 *********************************************/

class State {
	static CheckIn(error, points) {
		return {
			type   : error ? CHECK_IN_ERROR : CHECK_IN_SUCCESS,
			points : error ? undefined : points,
			error  : error || undefined,
		}
	}
}

/**********************************************
 ** Actions                                  **
 *********************************************/

const CheckInto = attendanceCode => {
	return async dispatch => {
		try {
			const response = await fetch(Config.API_URL + Config.routes.attendance.attend, {
				method: 'POST',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${Storage.get("token")}`
				},
				body: JSON.stringify({ event: { attendanceCode }})
			});

			const status = await response.status;
			if (status === 401 || status === 403) {
				return dispatch(Action.LogoutUser());
			}
			
			const data = await response.json();
			if (!data)
				throw new Error("Empty response from server");
			if (data.error)
				throw new Error(data.error.message);

			dispatch(State.CheckIn(null, data.event.attendancePoints));
			dispatch(Action.FetchUser());
			dispatch(Action.GetCurrentEvents());
		} catch (err) {
			dispatch(State.CheckIn(err.message));
		}
	}
}

/**********************************************
 ** Check In Reducer                         **
 *********************************************/

const CheckIn = (state=defaultState, action) => {
	switch(action.type) {
		case CHECK_IN_SUCCESS:
			return state.withMutations(val => {
				val.set('error', null);
				val.set('success', true);
				val.set('submitted', true);
				val.set('numPoints', action.points);
			});

		case CHECK_IN_ERROR:
			return state.withMutations(val => {
				val.set('error', action.error);
				val.set('success', false);
				val.set('submitted', true);
			});

		case CHECK_IN_RESET:
			return defaultState;

		default:
			return state;
	}
}

const ResetCheckIn = () => ({ type: CHECK_IN_RESET });
export {
	CheckIn, CheckInto, ResetCheckIn
}
