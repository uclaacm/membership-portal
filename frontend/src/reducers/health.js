import Immutable from 'immutable';

import Config from 'config';
import C from 'constants';


const storageAvailable = (type)=>{
	try {
		var storage = window[type],
			x = '__storage_test__';
		storage.setItem(x, x);
		storage.removeItem(x);
		return true;
	}
	catch(e) {
		return false;
	}
};


/////////////
// Actions //
/////////////

const TIME_GET = Symbol('TIME_GET');
const TIME_UPDATE = Symbol('TIME_UPDATE');
const TIME_UPDATE_ERR = Symbol('TIME_UPDATE_ERR');

const TimeUpdate = (time)=>{
  return {
    type: C.TIME_UPDATE,
    time,
  };
};

const TimeUpdateErr = (err)=>{
  return {
    type: C.TIME_UPDATE_ERR,
    err,
  };
};

const TimeGet = ()=>{
  return async (dispatch)=>{
    dispatch({
      type: C.TIME_GET,
    });
    try {
      const response = await fetch(Config.health.url, {
        method: 'GET',
      });
      const status = await response.status;
      if(status >= 200 && status < 300){
        // const data = await response.json();
        const data = await response.text();
        dispatch(TimeUpdate(data));
      } else {
        throw new Error('Could not get time from api server');
      }
    } catch(e) {
      dispatch(TimeUpdateErr(e.message));
    }
  };
};


///////////
// State //
///////////

const defaultState = Immutable.fromJS({
  loading: false,
  success: false,
  time: '',
  err: '',
});

const initState = ()=>{
  // if(storageAvailable('localStorage')) {
  //   if(condition){
  //     return defaultState.withMutations((val)=>{
  //     });
  //   }
  //   localStorage.clear();
  // }
  return defaultState;
};


/////////////
// Reducer //
/////////////

const Health = (state=initState(), action)=>{
  switch (action.type) {
    case C.TIME_GET:
      return state.withMutations((val)=>{
        val.set('loading', true);
        val.set('success', false);
        val.set('time', '');
        val.set('err', '');
      });
    case C.TIME_UPDATE:
      return state.withMutations((val)=>{
        val.set('loading', false);
        val.set('success', true);
        val.set('time', action.time);
        val.set('err', '');
      });
    case C.TIME_UPDATE_ERR:
      return defaultState.withMutations((val)=>{
        val.set('loading', false);
        val.set('success', false);
        val.set('time', '');
        val.set('err', action.err);
      });
    default:
      return state;
  }
};

export {
  Health, TimeGet,
}
