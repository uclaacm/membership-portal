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

const FETCH_PAST_EVENTS = Symbol('FETCH_PAST_EVENTS');
const FETCH_PAST_EVENT = Symbol('FETCH_PAST_EVENT');
const FETCH_FUTURE_EVENTS = Symbol('FETCH_FUTURE_EVENTS');
const FETCH_FUTURE_EVENT = Symbol('FETCH_FUTURE_EVENT');
const UPDATE_EVENTS = Symbol('UPDATE_EVENTS');
const UPDATE_EVENTS_ERROR = Symbol('UPDATE_EVENTS_ERROR');
const POST_EVENT_SUCCESS = Symbol('POST_EVENT_SUCCESS');
const POST_EVENT_ERR = Symbol('POST_EVENT_ERR');

const UpdateEvents = (events)=>{
    return({
        type: UPDATE_EVENTS,
        events
    });
};

const UpdateEventsError = (error)=>{
    return {
        type: UPDATE_EVENTS_ERROR,
        error
    };
};

const GetCurrentEvents = ()=>{
    return async (dispatch)=>{
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

            if (data && !data.error) {
                const events = data.events.map(event => ({
                  cover: event.cover,
                  committee: event.committee,
                  startDate: moment(event.startDate),
                  endDate: moment(event.endDate),
                  eventLink: event.eventLink,
                  title: event.title,
                  location: event.location,
                  description: event.description,
                  attendancePoints: event.attendancePoints
                }));
                dispatch(UpdateEvents(events));
            } else {
                throw new Error('Error fetching events');
            }
        } catch (err) {
            dispatch(UpdateEventsError(err));
        }
    };
};

const PostNewEventSuccess = ()=>{
  return {
    type: POST_EVENT_SUCCESS,
  };
};

const PostNewEventErr = (err)=>{
  return {
    type: POST_EVENT_ERR,
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

      if(!data.error){
        dispatch(PostNewEventSuccess());
        dispatch(GetCurrentEvents());
      } else {
        throw new Error('Error creating a new event: ' + data.error);
      }
    } catch(err){
      dispatch(PostNewEventErr(err));
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
        val.set('events', action.events)
      });

    case UPDATE_EVENTS_ERROR:
      return state.withMutations(val => {
        val.set('error', action.error);
        val.set('events', []);
      });

    case POST_EVENT_SUCCESS:
      return state.withMutations((val)=>{
        val.set('posted', true);
        val.set('postSuccess', true);
        val.set('error', '');
      });

    case POST_EVENT_ERR:
      return state.withMutations((val)=>{
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
