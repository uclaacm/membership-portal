import Config from 'config';
import Immutable from 'immutable';
import Storage from 'storage';

/** *********************************************
 ** Constants                                 **
 ********************************************** */

const RESET_ONECLICK_PASSWORD_SUCCESS = Symbol();
const RESET_ONECLICK_PASSWORD_ERROR = Symbol();
const RESET_ONECLICK_PASSWORD_DONE = Symbol();

const defaultState = Immutable.fromJS({
  error: null,
  updated: false,
  updateSuccess: false,
});

/** *********************************************
 ** OneClick States                           **
 ********************************************** */

class State {
  static ChangeOneClickPassword(error) {
    return {
      type: error ? RESET_ONECLICK_PASSWORD_ERROR : RESET_ONECLICK_PASSWORD_SUCCESS,
      error: error || undefined,
    };
  }
}

/** *********************************************
 ** Actions                                   **
 ********************************************** */

const ChangeOneClickPassword = (oldPassword, newPassword) => async (dispatch) => {
  try {
    const response = await fetch(Config.API_URL + Config.routes.auth.oneclick, {
      method: 'PATCH',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Storage.get('token')}`,
      },
      body: JSON.stringify({ oldPassword, newPassword }),
    });

    const data = await response.json();

    if (!data) throw new Error('Empty response from server');
    if (data.error) throw new Error(data.error.message);

    dispatch(State.ChangeOneClickPassword());
  } catch (err) {
    dispatch(State.ChangeOneClickPassword(err));
  }
};

/** *********************************************
 ** OneClick Reducer                          **
 ********************************************** */

const OneClick = (state = defaultState, action) => {
  switch (action.type) {
    case RESET_ONECLICK_PASSWORD_SUCCESS:
      return state.withMutations((val) => {
        val.set('error', null);
        val.set('updated', true);
        val.set('updateSuccess', true);
      });

    case RESET_ONECLICK_PASSWORD_ERROR:
      return state.withMutations((val) => {
        val.set('error', action.error);
        val.set('updated', true);
        val.set('updateSuccess', false);
      });

    case RESET_ONECLICK_PASSWORD_DONE:
      return state.withMutations((val) => {
        val.set('error', null);
        val.set('updated', false);
      });

    default:
      return state;
  }
};

const ChangeOneClickPasswordDone = () => ({ type: RESET_ONECLICK_PASSWORD_DONE });

export { OneClick, ChangeOneClickPassword, ChangeOneClickPasswordDone };
