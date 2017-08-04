import moment from 'moment';
import Config from 'config';
import Storage from 'storage';
import Immutable from 'immutable';

import { LogoutUser } from './auth';

//////////////////
//// ACTIONS /////
//////////////////

const GET_EVENTS = Symbol('GET_EVENTS');
const GET_EVENTS_ERROR = Symbol('GET_EVENTS_ERROR');
const POST_EVENT_SUCCESS = Symbol('POST_EVENT_SUCCESS');
const POST_EVENT_ERROR = Symbol('POST_EVENT_ERROR');
const POST_EVENT_DONE = Symbol('POST_EVENT_DONE');
const UPDATE_EVENT_SUCCESS = Symbol('UPDATE_EVENT_SUCCESS');
const UPDATE_EVENT_ERROR = Symbol('UPDATE_EVENT_ERROR');
const UPDATE_EVENT_DONE = Symbol('UPDATE_EVENT_DONE');

const UpdateEvents = (events)=>{
	return {
		type: GET_EVENTS,
		events
	};
};

const UpdateEventsError = (error)=>{
	return {
		type: GET_EVENTS_ERROR,
		error
	};
};

const GetCurrentEvents = () => {
	return async (dispatch) => {
		try {
			const response = await fetch(Config.API_URL + Config.routes.events.event, {
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

			if(!data){
				throw new Error("Empty response from server");
			} else if(data.error){
				throw new Error(data.error.message);
			}

			const response2 = await fetch(Config.API_URL + Config.routes.attendance.fetch, {
				method: 'GET',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${Storage.get("token")}`
				}
			});

			const status2 = await response2.status;
			const data2 = await response2.json();

			if(!data2){
				throw new Error("Empty response from server");
			} else if(data2.error){
				throw new Error(data2.error.message);
			}

			let attendanceMap = {};
			for (let record of data2.attendance)
				attendanceMap[record.event] = true;

			const events = data.events.map(event => ({
				uuid: event.uuid,
				cover: event.cover,
				committee: event.committee,
				startDate: moment(event.startDate),
				endDate: moment(event.endDate),
				eventLink: event.eventLink,
				title: event.title,
				location: event.location,
				description: event.description,
				attendancePoints: event.attendancePoints,
				checkedIn: !!attendanceMap[event.uuid],
			}));

			dispatch(UpdateEvents(events));
		} catch (err) {
			dispatch(UpdateEventsError(err.message));
		}
	};
};

const PostNewEventSuccess = () => {
	return {
		type: POST_EVENT_SUCCESS,
	};
};

const PostNewEventErr = (err) => {
	return {
		type: POST_EVENT_ERROR,
		error: err,
	};
};

const CreateEventDone = () => {
	return {
		type: POST_EVENT_DONE
	};
};

const PostNewEvent = (newevent)=>{
	return async (dispatch)=>{
		try {
			const response = await fetch(Config.API_URL + Config.routes.events.event, {
				method: 'POST',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${Storage.get("token")}`
				},
				body: JSON.stringify({'event': newevent}),
			});

			const status = await response.status;

            if (status === 401 || status === 403) {
				dispatch(LogoutUser());
			}
			
			const data = await response.json();

			if (!data)
				throw new Error("Empty response from server");
			if (data.error)
				throw new Error(data.error.message);

			dispatch(PostNewEventSuccess());
			dispatch(GetCurrentEvents());
		} catch(err){
			dispatch(PostNewEventErr(err.message));
		}
	};
};

const UpdateEventSuccess = () => {
	return {
		type: UPDATE_EVENT_SUCCESS,
	};
};

const UpdateEventErr = (err) => {
	return {
		type: UPDATE_EVENT_ERROR,
		error: err,
	};
};

const UpdateEventDone = () => {
	return {
		type: UPDATE_EVENT_DONE
	};
};

const UpdateEvent = (event)=>{
	return async (dispatch)=>{
		try {
			const response = await fetch((Config.API_URL + Config.routes.events.event + '/' + event.uuid), {
				method: 'PATCH',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${Storage.get("token")}`
				},
				body: JSON.stringify({'event': event}),
			});

			const status = await response.status;

            if (status === 401 || status === 403) {
				dispatch(LogoutUser());
			}
			
			const data = await response.json();

			if (!data)
				throw new Error("Empty response from server");
			if (data.error)
				throw new Error(data.error.message);

			dispatch(UpdateEventSuccess());
			dispatch(GetCurrentEvents());
		} catch(err){
			dispatch(UpdateEventErr(err.message));
		}
	};
};

///////////////
/// STATE /////
///////////////

const defaultState = Immutable.fromJS({
	events: [],
	error: '',
	posted: false,
	postSuccess: false,
	updated: false,
	updateSuccess: false,
});

//////////////////
//// REDUCERS ////
//////////////////

const Events = (state=defaultState, action) => {
	switch(action.type) {
		case GET_EVENTS:
			return state.withMutations(val => {
				val.set('events', action.events)
			});

		case GET_EVENTS_ERROR:
			return state.withMutations(val => {
				val.set('error', action.error);
				val.set('events', []);
			});

		case POST_EVENT_SUCCESS:
			return state.withMutations(val => {
				val.set('posted', true);
				val.set('postSuccess', true);
				val.set('error', '');
			});

		case POST_EVENT_ERROR:
			return state.withMutations(val => {
				val.set('posted', true);
				val.set('postSuccess', false);
				val.set('error', action.error);
			});

		case UPDATE_EVENT_SUCCESS:
			return state.withMutations(val => {
				val.set('updated', true);
				val.set('updateSuccess', true);
				val.set('error', '');
			});

		case UPDATE_EVENT_ERROR:
			return state.withMutations(val => {
				val.set('updated', true);
				val.set('updateSuccess', false);
				val.set('error', action.error);
			});

		case POST_EVENT_DONE:
		case UPDATE_EVENT_DONE:
			return state.withMutations(val => {
				val.set('updated', false);
				val.set('posted', false);
				val.set('error', '');
			});

		default:
			return state;
	}
}

export {
	Events, GetCurrentEvents, PostNewEvent, UpdateEvent, CreateEventDone, UpdateEventDone
}
