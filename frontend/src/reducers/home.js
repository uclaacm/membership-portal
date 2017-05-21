import immutable from 'immutable';
import Config from 'config';

/////////////////
/// UTILITY /////
/////////////////

const setStorage = (key,item) => {
    localStorage.setItem(key, item);
}

const getFromStorage = (key) => localStorage.getItem(key);

const removeFromStorage = (key) => localStorage.removeItem(key);

//////////////////
//// ACTIONS /////
//////////////////


const FETCH_EVENTS = Symbol('FETCH_EVENTS');
const FETCH_SINGLE_EVENT = Symbol('FETCH_SINGLE_EVENT');
const FETCH_PAST_EVENTS = Symbol('FETCH_PAST_EVENTS');
const FETCH_PAST_EVENT = Symbol('FETCH_PAST_EVENT');
const FETCH_FUTURE_EVENTS = Symbol('FETCH_FUTURE_EVENTS');
const FETCH_FUTURE_EVENT = Symbol('FETCH_FUTURE_EVENT');

const UPDATE_EVENTS = Symbol('UPDATE_EVENTS');

const UPDATE_EVENTS_ERROR = Symbol('UPDATE_EVENTS_ERROR');

const FetchEvents = () => {
    return({
        type: FETCH_EVENTS
    });
}

const FetchEvent = (id) => {
    return({
        type: FETCH_SINGLE_EVENT,
        id
    });
}

const UpdateEvents = (events) => {
    return({
        type: UPDATE_EVENTS,
        events
    });
}

const UpdateEventsError = (error) => {
    return({
        type: UPDATE_EVENTS_ERROR,
        error
    });
}

const GetCurrentEvents = () => {
    return async (dispatch) => {
        try {
            const response = await fetch(Config.API_URL + Config.routes.events, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getFromStorage("token")}`
                },
                body: JSON.stringify({"password": password, "email": email}),
            });
            const status = await response.status;
            if (status >= 200 && status < 300) {
                const data = await response.json();
                const events = data.events;
                dispatch(UpdateEvents(events));
            } else {
                if (data.error) {
                    throw new Error(data.error);
                } else {
                    throw new Error('Error fetching events');
                }
            }
        } catch (err) {
            dispatch(UpdateEventsError(err));
        }
    }
}

///////////////
/// STATE /////
///////////////

const defaultState = Immutable.fromJS({
    events: [],
    error: ''
});

const initState = () => {

    return defaultState;
}

//////////////////
//// REDUCERS ////
//////////////////

const Events = (state=initState(), action) => {
    switch(action.type) {
        case UPDATE_EVENTS:
            return state.withMutations(val => {
                val.set('events': action.events)
            });

        case UPDATE_EVENTS_ERROR:
            return state.withMutations(val => {
                val.set('error', action.error);
                val.set('events': []);
            });

        default:
            return state;
    }
}

export default {
    Events, GetCurrentEvents
}
