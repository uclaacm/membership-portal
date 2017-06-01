import Immutable from 'immutable';
import Config from 'config';
import moment from 'moment';

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

const FETCH_SUCCESS = Symbol('FETCH_SUCCESS');
const FETCH_ERR = Symbol('FETCH_ERR');
const INVALIDATE = Symbol('INVALIDATE');

const fetchSuccess = (leaderboard)=>{
    return {
        type: FETCH_SUCCESS,
        time: Date.now(),
        leaderboard,
    };
};

const fetchError = (error)=>{
    return {
        type: FETCH_ERR,
        error,
    };
};

const FetchLeaderboard = ()=>{
  return async (dispatch)=>{
    try {
      const response = await fetch(Config.API_URL + Config.routes.leaderboard, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getFromStorage("token")}`
        }
      });
      const status = await response.status;
      const data = await response.json();

      if(!data.error) {
        dispatch(fetchSuccess(data.leaderboard));
      } else {
        throw new Error('Error fetching leaderboard: ' + data.error);
      }
    } catch(err){
      dispatch(fetchError(err));
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

const initState = () => {
  return defaultState;
}

//////////////////
//// REDUCERS ////
//////////////////

const Leaderboard = (state=initState(), action) => {
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
