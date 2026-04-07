import Config from 'config';
import Storage from 'storage';
import Immutable from 'immutable';
import { Action } from 'reducers';

/** *********************************************
 ** Constants                                 **
 ********************************************** */

const CHECK_IN_SUCCESS = Symbol();
const CHECK_IN_ERROR = Symbol();
const CHECK_IN_RESET = Symbol();
const FETCH_CHECKED_IN_EVENTS_SUCCESS = Symbol();
const FETCH_CHECKED_IN_EVENTS_ERROR = Symbol();
const ADD_CHECKED_IN_EVENT = Symbol();

const defaultState = Immutable.fromJS({
  // Last check-in attempt
  submitted: false,
  success: false,
  numPoints: 0,
  error: null,
  
  // All checked-in events for current user
  checkedInEvents: Immutable.Set(),  // Set of event UUIDs
});

/** *********************************************
 ** Check In States                           **
 ********************************************** */

class State {
  static CheckIn(error, points) {
    return {
      type: error ? CHECK_IN_ERROR : CHECK_IN_SUCCESS,
      points: error ? undefined : points,
      error: error || undefined,
    };
  }

  static FetchCheckedInEvents(error, eventUuids = []) {
    return {
      type: error ? FETCH_CHECKED_IN_EVENTS_ERROR : FETCH_CHECKED_IN_EVENTS_SUCCESS,
      eventUuids,
      error: error || undefined,
    };
  }

  static AddCheckedInEvent(eventUuid) {
    return {
      type: ADD_CHECKED_IN_EVENT,
      eventUuid,
    };
  }
}

/** *********************************************
 ** Actions                                   **
 ********************************************** */

// Fetch all checked-in events for current user
const FetchCheckedInEvents = () => async (dispatch) => {
  try {
    const response = await fetch(Config.API_URL + Config.routes.attendance.fetch, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Storage.get('token')}`,
      },
    });

    const status = await response.status;
    if (status === 401 || status === 403) {
      return dispatch(Action.LogoutUser());
    }

    const data = await response.json();
    if (!data) throw new Error('Empty response from server');
    if (data.error) throw new Error(data.error.message);

    // Extract event UUIDs from attendance records
    const eventUuids = data.attendance.map(record => record.event);
    dispatch(State.FetchCheckedInEvents(null, eventUuids));
  } catch (err) {
    dispatch(State.FetchCheckedInEvents(err.message));
  }
};

// Check in to an event (existing logic + add to local state)
const CheckInto = attendanceCode => async (dispatch) => {
  try {
    const response = await fetch(Config.API_URL + Config.routes.attendance.attend, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Storage.get('token')}`,
      },
      body: JSON.stringify({ event: { attendanceCode } }),
    });

    const status = await response.status;
    if (status === 401 || status === 403) {
      return dispatch(Action.LogoutUser());
    }

    const data = await response.json();
    if (!data) throw new Error('Empty response from server');
    if (data.error) throw new Error(data.error.message);

    dispatch(State.AddCheckedInEvent(data.event.uuid));
    
    dispatch(State.CheckIn(null, data.event.attendancePoints));
    dispatch(Action.FetchUser());
    
    dispatch(Action.FetchCheckedInEvents())
  } catch (err) {
    dispatch(State.CheckIn(err.message));
  }
};

/** *********************************************
 ** Check In Reducer                          **
 ********************************************** */

const CheckIn = (state = defaultState, action) => {
  switch (action.type) {
    case CHECK_IN_SUCCESS:
      return state.withMutations((val) => {
        val.set('error', null);
        val.set('success', true);
        val.set('submitted', true);
        val.set('numPoints', action.points);
      });

    case CHECK_IN_ERROR:
      return state.withMutations((val) => {
        val.set('error', action.error);
        val.set('success', false);
        val.set('submitted', true);
      });

    case CHECK_IN_RESET:
      return state.withMutations((val) => {
        val.set('submitted', false);
        val.set('success', false);
        val.set('numPoints', 0);
        val.set('error', null);
      });

    case FETCH_CHECKED_IN_EVENTS_SUCCESS:
      return state.set('checkedInEvents', Immutable.Set(action.eventUuids));

    case FETCH_CHECKED_IN_EVENTS_ERROR:
      return state.set('error', action.error);

    case ADD_CHECKED_IN_EVENT:
      return state.update('checkedInEvents', set => set.add(action.eventUuid));

    default:
      return state;
  }
};

const ResetCheckIn = () => ({ type: CHECK_IN_RESET });

export { CheckIn, CheckInto, ResetCheckIn, FetchCheckedInEvents };