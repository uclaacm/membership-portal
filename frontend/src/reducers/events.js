import moment from 'moment';
import Config from 'config';
import Immutable from 'immutable';
import Storage from 'storage';

import { LogoutUser } from './auth';

/** *********************************************
 ** Constants                                 **
 ********************************************** */

const FETCH_EVENTS_SUCCESS = Symbol();
const FETCH_EVENTS_ERROR = Symbol();

const DELETE_EVENT_SUCCESS = Symbol();
const DELETE_EVENT_ERROR = Symbol();

const POST_EVENT_SUCCESS = Symbol();
const POST_EVENT_ERROR = Symbol();
const POST_EVENT_DONE = Symbol();

const UPDATE_EVENT_SUCCESS = Symbol();
const UPDATE_EVENT_ERROR = Symbol();
const UPDATE_EVENT_DONE = Symbol();

const SYNC_EVENTS_SUCCESS = Symbol();
const SYNC_EVENTS_ERROR = Symbol();
const SYNC_EVENTS_DONE = Symbol();

const defaultState = Immutable.fromJS({
  events: [],
  error: null,
  posted: false,
  updated: false,
  deleted: false,
  postSuccess: false,
  updateSuccess: false,
  deleteSuccess: false,
  synced: false,
  syncSuccess: false,
  syncMessage: null,
});

/** *********************************************
 ** Event States                              **
 ********************************************** */

class State {
  static FetchEvents(error, events) {
    return {
      type: error ? FETCH_EVENTS_ERROR : FETCH_EVENTS_SUCCESS,
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

  static DeleteEvent(error) {
    return {
      type: error ? DELETE_EVENT_ERROR : DELETE_EVENT_SUCCESS,
      error: error || undefined,
    };
  }

  static SyncEvents(error, message) {
    return {
      type: error ? SYNC_EVENTS_ERROR : SYNC_EVENTS_SUCCESS,
      error: error || undefined,
      message: message || undefined,
    };
  }
}

/** ********************************************
 ** Actions                                  **
 ********************************************* */

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
    const response = await fetch(`${Config.API_URL + Config.routes.events.event}/${event.uuid}`, {
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

const DeleteEvent = uuid => async (dispatch) => {
  try {
    const response = await fetch(`${Config.API_URL + Config.routes.events.event}/${uuid}`, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Storage.get('token')}`,
      },
    });

    const status = await response.status;
    if (status === 401 || status === 403) {
      dispatch(LogoutUser());
    }

    const data = await response.json();
    if (!data) throw new Error('Empty response from server');

    dispatch(State.DeleteEvent());
    dispatch(GetCurrentEvents());
  } catch (err) {
    dispatch(State.DeleteEvent(err.message));
  }
};

const SyncEventsFromSheets = () => async (dispatch) => {
  try {
    const response = await fetch(`${Config.API_URL}/api/v1/sheets/event`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Storage.get('token')}`,
      },
    });

    const status = await response.status;
    if (status === 401 || status === 403) {
      return dispatch(LogoutUser());
    }

    const data = await response.json();
    if (!data) throw new Error('Empty response from server');

    // If sync completely failed (no events synced).
    if (!data.success && data.total === 0) {
      throw new Error(data.message || 'Failed to sync events');
    }

    // Refresh events after sync (success or partial success).
    dispatch(State.SyncEvents(null, data.message));
    dispatch(GetCurrentEvents());
  } catch (err) {
    dispatch(State.SyncEvents(err.message));
  }
};

/** *********************************************
 ** Events Reducer                            **
 ********************************************** */

const Events = (state = defaultState, action) => {
  switch (action.type) {
    case FETCH_EVENTS_SUCCESS:
      return state.withMutations((val) => {
        val.set('error', null);
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

    case DELETE_EVENT_SUCCESS:
      return state.withMutations((val) => {
        val.set('error', 'null');
        val.set('deleted', true);
        val.set('deleteSuccess', true);
      });

    case DELETE_EVENT_ERROR:
      return state.withMutations((val) => {
        val.set('error', action.error);
        val.set('deleted', true);
        val.set('deleteSuccess', false);
      });

    case SYNC_EVENTS_SUCCESS:
      return state.withMutations((val) => {
        val.set('error', null);
        val.set('synced', true);
        val.set('syncSuccess', true);
        val.set('syncMessage', action.message);
      });

    case SYNC_EVENTS_ERROR:
      return state.withMutations((val) => {
        val.set('error', action.error);
        val.set('synced', true);
        val.set('syncSuccess', false);
        val.set('syncMessage', null);
      });

    case SYNC_EVENTS_DONE:
      return state.withMutations((val) => {
        val.set('error', null);
        val.set('synced', false);
        val.set('syncMessage', null);
      });

    default:
      return state;
  }
};

const CreateEventDone = () => ({ type: POST_EVENT_DONE });
const UpdateEventDone = () => ({ type: UPDATE_EVENT_DONE });
const SyncEventsDone = () => ({ type: SYNC_EVENTS_DONE });

export {
  Events, GetCurrentEvents, PostNewEvent, UpdateEvent, DeleteEvent, CreateEventDone, UpdateEventDone, SyncEventsFromSheets, SyncEventsDone,
};
