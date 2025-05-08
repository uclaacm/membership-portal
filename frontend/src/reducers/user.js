import Immutable from 'immutable';
import Storage from 'storage';
import Config from 'config';
import moment from 'moment';

import { LogoutUser } from './auth';

/** *********************************************
 ** Constants                                 **
 ********************************************** */

const FETCH_USER = Symbol();
const FETCH_USER_ERR = Symbol();

const UPDATE_USER_ERR = Symbol();
const UPDATE_USER_SUCCESS = Symbol();
const UPDATE_COMPLETED = Symbol();

const FETCH_ACTIVITY_SUCCESS = Symbol();
const FETCH_ACTIVITY_ERR = Symbol();

const defaultState = Immutable.fromJS({
  profile: {},
  activity: [],
  userUpdated: false,
  userUpdateSuccess: false,
  userFetchSuccess: false,
  error: null,
  activityError: null,
});

/** *********************************************
 ** User States                               **
 ********************************************** */

class State {
  static FetchUser(error, user) {
    return {
      type: error ? FETCH_USER_ERR : FETCH_USER,
      user: error ? undefined : user,
      error: error || undefined,
    };
  }

  static UpdateUser(error) {
    return {
      type: error ? UPDATE_USER_ERR : UPDATE_USER_SUCCESS,
      error: error || undefined,
    };
  }

  static FetchActivity(error, activity) {
    return {
      type: error ? FETCH_ACTIVITY_ERR : FETCH_ACTIVITY_SUCCESS,
      activity: error ? undefined : activity,
      error: error || undefined,
    };
  }
}

/** *********************************************
 ** Actions                                   **
 ********************************************** */

const FetchUser = () => async (dispatch) => {
  try {
    const response = await fetch(Config.API_URL + Config.routes.user.user, {
      method: 'GET',
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
    if (data.error) throw new Error(data.error.message);

    dispatch(State.FetchUser(null, data.user));
  } catch (err) {
    dispatch(State.FetchUser(err.message));
  }
};

const UpdateUser = user => async (dispatch) => {
  try {
    const response = await fetch(Config.API_URL + Config.routes.user.user, {
      method: 'PATCH',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Storage.get('token')}`,
      },
      body: JSON.stringify({ user }),
    });

    const status = await response.status;
    if (status === 401 || status === 403) {
      return dispatch(LogoutUser());
    }

    const data = await response.json();
    if (!data) throw new Error('Empty response from server');
    if (data.error) throw new Error(data.error.message);

    dispatch(State.FetchUser(null, data.user));
    dispatch(State.UpdateUser());
  } catch (err) {
    dispatch(State.UpdateUser(err.message));
  }
};

const FetchActivity = () => async (dispatch) => {
  try {
    const response = await fetch(Config.API_URL + Config.routes.user.activity, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Storage.get('token')}`,
      },
    });

    const status = await response.status;
    const data = await response.json();
    if (!data) throw new Error('Empty response from server');
    if (data.error) throw new Error(data.error.message);

    const activity = data.activity.map((a) => {
      a.date = moment(a.date);
      return a;
    });

    dispatch(State.FetchActivity(null, activity));
  } catch (err) {
    dispatch(State.FetchActivity(err.message));
  }
};

/** *********************************************
 ** User Reducer                              **
 ********************************************** */

const User = (state = defaultState, action) => {
  switch (action.type) {
    case FETCH_USER:
      return state.withMutations((val) => {
        val.set('error', null);
        val.set('profile', action.user);
        val.set('fetchSuccess', true);
      });

    case FETCH_USER_ERR:
      return state.withMutations((val) => {
        val.set('error', action.error);
        val.set('profile', {});
        val.set('fetchSuccess', false);
      });

    case UPDATE_USER_ERR:
      return state.withMutations((val) => {
        val.set('error', action.error);
        val.set('updated', true);
        val.set('updateSuccess', false);
      });

    case UPDATE_USER_SUCCESS:
      return state.withMutations((val) => {
        val.set('error', null);
        val.set('updated', true);
        val.set('updateSuccess', true);
      });

    case UPDATE_COMPLETED:
      return state.withMutations((val) => {
        val.set('updated', false);
      });

    case FETCH_ACTIVITY_SUCCESS:
      return state.withMutations((val) => {
        val.set('activity', action.activity);
        val.set('activityError', null);
      });

    case FETCH_ACTIVITY_ERR:
      return state.withMutations((val) => {
        val.set('activity', []);
        val.set('activityError', action.error);
      });

    default:
      return state;
  }
};

const UserUpdateDone = () => ({ type: UPDATE_COMPLETED });

export {
  User, FetchUser, UpdateUser, UserUpdateDone, FetchActivity,
};
