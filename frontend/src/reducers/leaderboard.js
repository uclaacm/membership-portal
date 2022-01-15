import Config from 'config';
import Storage from 'storage';
import Immutable from 'immutable';

import { LogoutUser } from './auth';

/** ********************************************
 ** Constants                                **
 ******************************************** */

const FETCH_SUCCESS = Symbol();
const FETCH_ERR = Symbol();
const INVALIDATE = Symbol();

const defaultState = Immutable.fromJS({
  leaderboard: [],
  error: null,
  fetched: false,
  fetchSuccess: false,
  fetchTime: 0,
});

/** ********************************************
 ** Leaderboard States                       **
 ******************************************** */

class State {
  static FetchLeaderboard(error, leaderboard) {
    return {
      type: error ? FETCH_ERR : FETCH_SUCCESS,
      time: error ? undefined : Date.now(),
      leaderboard: error ? undefined : leaderboard,
      error: error || undefined,
    };
  }
}

/** ********************************************
 ** Actions                                  **
 ******************************************** */

const FetchLeaderboard = () => async (dispatch) => {
  try {
    const response = await fetch(Config.API_URL + Config.routes.leaderboard, {
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

    dispatch(State.FetchLeaderboard(null, data.leaderboard));
  } catch (err) {
    dispatch(State.FetchLeaderboard(err.message));
  }
};

/** ********************************************
 ** Leaderboard Reducer                      **
 ******************************************** */

const Leaderboard = (state = defaultState, action) => {
  switch (action.type) {
    case FETCH_SUCCESS:
      return state.withMutations((val) => {
        val.set('error', null);
        val.set('fetched', true);
        val.set('fetchTime', action.time);
        val.set('fetchSuccess', true);
        val.set('leaderboard', action.leaderboard);
      });

    case FETCH_ERR:
      return state.withMutations((val) => {
        val.set('error', action.error);
        val.set('fetched', true);
        val.set('fetchSuccess', false);
      });

    case INVALIDATE:
      return state.withMutations((val) => {
        val.set('fetchTime', 0);
      });

    default:
      return state;
  }
};

const InvalidateLeaderboard = () => ({ type: INVALIDATE });
export {
  Leaderboard, FetchLeaderboard, InvalidateLeaderboard,
};
