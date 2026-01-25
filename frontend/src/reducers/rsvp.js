import Immutable from 'immutable';
import Config from 'config';

// Action Types
const RSVP_SUCCESS = Symbol('RSVP_SUCCESS');
const RSVP_ERROR = Symbol('RSVP_ERROR');
const CANCEL_RSVP_SUCCESS = Symbol('CANCEL_RSVP_SUCCESS');
const CANCEL_RSVP_ERROR = Symbol('CANCEL_RSVP_ERROR');
const FETCH_USER_RSVPS_SUCCESS = Symbol('FETCH_USER_RSVPS_SUCCESS');
const FETCH_USER_RSVPS_ERROR = Symbol('FETCH_USER_RSVPS_ERROR');
const FETCH_EVENT_RSVPS_SUCCESS = Symbol('FETCH_EVENT_RSVPS_SUCCESS');
const FETCH_EVENT_RSVPS_ERROR = Symbol('FETCH_EVENT_RSVPS_ERROR');

// Initial state
const State = Immutable.Map({
  error: '',
  userRsvps: Immutable.List(),
  eventRsvps: Immutable.List(),
  loading: false,
});

// Action Creators
class RSVPActions {
  static RSVP(error, eventUuid) {
    return {
      type: error ? RSVP_ERROR : RSVP_SUCCESS,
      eventUuid,
      error,
    };
  }

  static CancelRSVP(error, eventUuid) {
    return {
      type: error ? CANCEL_RSVP_ERROR : CANCEL_RSVP_SUCCESS,
      eventUuid,
      error,
    };
  }

  static FetchUserRSVPs(error, rsvps) {
    return {
      type: error ? FETCH_USER_RSVPS_ERROR : FETCH_USER_RSVPS_SUCCESS,
      rsvps,
      error,
    };
  }

  static FetchEventRSVPs(error, rsvps) {
    return {
      type: error ? FETCH_EVENT_RSVPS_ERROR : FETCH_EVENT_RSVPS_SUCCESS,
      rsvps,
      error,
    };
  }
}

// Async Actions
const CreateRSVP = eventUuid => async (dispatch) => {
  try {
    const response = await global.fetch(`${Config.API_URL}${Config.routes.rsvp.create}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${global.localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        event: {
          uuid: eventUuid,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to RSVP to event');
    }

    dispatch(RSVPActions.RSVP(null, eventUuid));
    return { success: true };
  } catch (err) {
    dispatch(RSVPActions.RSVP(err.message || 'Failed to RSVP to event'));
    return { success: false, error: err };
  }
};

const CancelRSVP = eventUuid => async (dispatch) => {
  try {
    const response = await global.fetch(`${Config.API_URL}${Config.routes.rsvp.cancel}/${eventUuid}`, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${global.localStorage.getItem('token')}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to cancel RSVP');
    }

    dispatch(RSVPActions.CancelRSVP(null, eventUuid));
    return { success: true };
  } catch (err) {
    dispatch(RSVPActions.CancelRSVP(err.message || 'Failed to cancel RSVP'));
    return { success: false, error: err };
  }
};

const FetchUserRSVPs = () => async (dispatch) => {
  try {
    const response = await global.fetch(Config.API_URL + Config.routes.rsvp.get, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${global.localStorage.getItem('token')}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch RSVPs');
    }

    dispatch(RSVPActions.FetchUserRSVPs(null, data.rsvps));
    return { success: true, rsvps: data.rsvps };
  } catch (err) {
    dispatch(RSVPActions.FetchUserRSVPs(err.message || 'Failed to fetch RSVPs'));
    return { success: false, error: err };
  }
};

const FetchEventRSVPs = eventUuid => async (dispatch) => {
  try {
    const response = await global.fetch(`${Config.API_URL}/api/v1/rsvp/event/${eventUuid}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${global.localStorage.getItem('token')}`,
      },
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch RSVPs');
    }

    dispatch(RSVPActions.FetchEventRSVPs(null, data.rsvps));
    return { success: true, rsvps: data.rsvps };
  } catch (err) {
    dispatch(RSVPActions.FetchEventRSVPs(err.message || 'Failed to fetch RSVPs'));
    return { success: false, error: err };
  }
};

// Reducer
const RSVP = (state = State, action) => {
  switch (action.type) {
    case RSVP_SUCCESS:
      return state.set('error', '');

    case RSVP_ERROR:
      return state.set('error', action.error);

    case CANCEL_RSVP_SUCCESS:
      return state.set('error', '');

    case CANCEL_RSVP_ERROR:
      return state.set('error', action.error);

    case FETCH_USER_RSVPS_SUCCESS:
      return state
        .set('error', '')
        .set('userRsvps', Immutable.fromJS(action.rsvps));

    case FETCH_USER_RSVPS_ERROR:
      return state
        .set('error', action.error)
        .set('userRsvps', Immutable.List());

    case FETCH_EVENT_RSVPS_SUCCESS:
      return state
        .set('error', '')
        .set('eventRsvps', Immutable.fromJS(action.rsvps));

    case FETCH_EVENT_RSVPS_ERROR:
      return state
        .set('error', action.error)
        .set('eventRsvps', Immutable.List());

    default:
      return state;
  }
};

export {
  RSVP,
  CreateRSVP,
  CancelRSVP,
  FetchUserRSVPs,
  FetchEventRSVPs,
};
