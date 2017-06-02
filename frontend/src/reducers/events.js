import moment from 'moment';
import Config from 'config';
import Immutable from 'immutable';

/////////////////
/// UTILITY /////
/////////////////

const setStorage = (key,item) => localStorage.setItem(key, item);
const getFromStorage = (key) => localStorage.getItem(key);
const removeFromStorage = (key) => localStorage.removeItem(key);

//////////////////
//// ACTIONS /////
//////////////////

const UPDATE_EVENTS = Symbol('UPDATE_EVENTS');
const UPDATE_EVENTS_ERROR = Symbol('UPDATE_EVENTS_ERROR');
const POST_EVENT_SUCCESS = Symbol('POST_EVENT_SUCCESS');
const POST_EVENT_ERROR = Symbol('POST_EVENT_ERROR');

const UpdateEvents = (events)=>{
	return {
		type: UPDATE_EVENTS,
		events
	};
};

const UpdateEventsError = (error)=>{
	return {
		type: UPDATE_EVENTS_ERROR,
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
					'Authorization': `Bearer ${getFromStorage("token")}`
				}
			});

			const status = await response.status;
			const data = await response.json();

			if (!data)
				throw new Error("Empty response from server");
			if (data.error)
				throw new Error(data.error.message);

			dispatch(UpdateEvents(data.events.map(event => ({
				cover: event.cover,
				committee: event.committee,
				startDate: moment(event.startDate),
				endDate: moment(event.endDate),
				eventLink: event.eventLink,
				title: event.title,
				location: event.location,
				description: event.description,
				attendancePoints: event.attendancePoints
			}))));
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

const PostNewEvent = (newevent)=>{
	return async (dispatch)=>{
		try {
			const response = await fetch(Config.API_URL + Config.routes.events.event, {
				method: 'POST',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${getFromStorage("token")}`
				},
				body: JSON.stringify({'event': newevent}),
			});

			const status = await response.status;
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

///////////////
/// STATE /////
///////////////

const defaultState = Immutable.fromJS({
	events: [],
	error: '',
	posted: false,
	postSuccess: false
});

//////////////////
//// REDUCERS ////
//////////////////

const Events = (state=defaultState, action) => {
	switch(action.type) {
		case UPDATE_EVENTS:
			return state.withMutations(val => {
				val.set('events', action.events)
			});

		case UPDATE_EVENTS_ERROR:
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

		default:
			return state;
	}
}

export {
	Events, GetCurrentEvents, PostNewEvent,
}
