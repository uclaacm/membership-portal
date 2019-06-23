import moment from 'moment';
import Config from 'config';
import Storage from 'storage';
import Immutable from 'immutable';

import { LogoutUser } from './auth';

/** ********************************************
 ** Constants                                **
 ******************************************** */

const FETCH_EVENTS = Symbol();
const FETCH_EVENTS_ERROR = Symbol();
const POST_EVENT_SUCCESS = Symbol();
const POST_EVENT_ERROR = Symbol();
const POST_EVENT_DONE = Symbol();
const UPDATE_EVENT_SUCCESS = Symbol();
const UPDATE_EVENT_ERROR = Symbol();
const UPDATE_EVENT_DONE = Symbol();

const defaultState = Immutable.fromJS({
  events: [],
  error: null,
  posted: false,
  updated: false,
  postSuccess: false,
  updateSuccess: false,
});

/** ********************************************
 ** Event States                              **
 ******************************************** */

class State {
  static FetchEvents(error, events) {
    return {
      type: error ? FETCH_EVENTS_ERROR : FETCH_EVENTS,
      events: error ? undefined : events,
      error: error || undefined,
    };
  }

  static PostEvent(error) {
    return {
      type: error ? POST_EVENT_ERROR : POST_EVENT_SUCCESS,
      error: error || undefined,
    };
  }

  static UpdateEvent(error) {
    return {
      type: error ? UPDATE_EVENT_ERROR : UPDATE_EVENT_SUCCESS,
      error: error || undefined,
    };
  }
}

/** ********************************************
 ** Actions                                  **
 ******************************************** */

const GetCurrentEvents = () => async (dispatch) => {
  try {
    const eventsRes = await fetch(Config.API_URL + Config.routes.events.event, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Storage.get('token')}`,
      },
    });

    let status = await eventsRes.status;
    if (status === 401 || status === 403) {
      return dispatch(LogoutUser());
    }

    const eventsData = await eventsRes.json();
    if (!eventsData) throw new Error('Empty response from server');
    else if (eventsData.error) throw new Error(eventsData.error.message);

    const attendanceRes = await fetch(Config.API_URL + Config.routes.attendance.fetch, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Storage.get('token')}`,
      },
    });

    status = await attendanceRes.status;
    const attendanceData = await attendanceRes.json();

    if (!attendanceData) throw new Error('Empty response from server');
    else if (attendanceData.error) throw new Error(attendanceData.error.message);

    const attendanceMap = {};
    for (const record of attendanceData.attendance) attendanceMap[record.event] = true;

    const events = eventsData.events.map((event) => {
      event.startDate = moment(event.startDate);
      event.endDate = moment(event.endDate);
      event.checkedIn = !!attendanceMap[event.uuid];
      return event;
    });

    dispatch(State.FetchEvents(null, events));
  } catch (err) {
    dispatch(State.FetchEvents(err.message));
  }
};

const PostNewEvent = event => async (dispatch) => {
  try {
    const response = await fetch(Config.API_URL + Config.routes.events.event, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Storage.get('token')}`,
      },
      body: JSON.stringify({ event }),
    });

    const status = await response.status;
    if (status === 401 || status === 403) {
      dispatch(LogoutUser());
    }

    const data = await response.json();
    if (!data) throw new Error('Empty response from server');
    if (data.error) throw new Error(data.error.message);

    dispatch(State.PostEvent());
    dispatch(GetCurrentEvents());
  } catch (err) {
    dispatch(State.PostEvent(err.message));
  }
};

const UpdateEvent = event => async (dispatch) => {
  try {
    const response = await fetch((`${Config.API_URL + Config.routes.events.event}/${event.uuid}`), {
      method: 'PATCH',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Storage.get('token')}`,
      },
      body: JSON.stringify({ event }),
    });

    const status = await response.status;
    if (status === 401 || status === 403) {
      dispatch(LogoutUser());
    }

    const data = await response.json();
    if (!data) throw new Error('Empty response from server');
    if (data.error) throw new Error(data.error.message);

    dispatch(State.UpdateEvent());
    dispatch(GetCurrentEvents());
  } catch (err) {
    dispatch(State.UpdateEvent(err.message));
  }
};

/** ********************************************
 ** Events Reducer                           **
 ******************************************** */

const Events = (state = defaultState, action) => {
  switch (action.type) {
    case FETCH_EVENTS:
      return state.withMutations((val) => {
        val.set('events', action.events);
      });

    case FETCH_EVENTS_ERROR:
      return state.withMutations((val) => {
        val.set('error', action.error);
        val.set('events', []);
      });

    case POST_EVENT_SUCCESS:
      return state.withMutations((val) => {
        val.set('error', null);
        val.set('posted', true);
        val.set('postSuccess', true);
      });

    case POST_EVENT_ERROR:
      return state.withMutations((val) => {
        val.set('error', action.error);
        val.set('posted', true);
        val.set('postSuccess', false);
      });

    case UPDATE_EVENT_SUCCESS:
      return state.withMutations((val) => {
        val.set('error', null);
        val.set('updated', true);
        val.set('updateSuccess', true);
      });

    case UPDATE_EVENT_ERROR:
      return state.withMutations((val) => {
        val.set('error', action.error);
        val.set('updated', true);
        val.set('updateSuccess', false);
      });

    case POST_EVENT_DONE:
    case UPDATE_EVENT_DONE:
      return state.withMutations((val) => {
        val.set('error', null);
        val.set('updated', false);
        val.set('posted', false);
      });

    default:
      return state;
  }
};

const CreateEventDone = () => ({ type: POST_EVENT_DONE });
const UpdateEventDone = () => ({ type: UPDATE_EVENT_DONE });
export {
  Events, GetCurrentEvents, PostNewEvent, UpdateEvent, CreateEventDone, UpdateEventDone,
};
