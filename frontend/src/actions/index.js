import cookie from 'react-cookie';

import config from '../config';
import C from '../constants';


///////////////////////
// UTILITY FUNCTIONS //
///////////////////////

export function fetchUser(token) {

    return async (dispatch) => {
        dispatch({
            type: C.FETCH_USER
        });

        try {
            const response = await fetch(config.routes.user, {
              method: 'GET',
              headers: {
                  "Authorization": `Bearer ${token}`,
              }
            });
            const status = await response.status;
            if (status >=200 && status<300) {
                const data = await response.json();
                //TODO do something with this data!
            } else {
                throw new Error('Could not get user from api server');
            }
        } catch (err) {

        }
    }
}

export function registerUser(user) => {
    return async (dispatch) => {
        try {
            const response = await fetch(config.routes.auth.register, {
                method: 'POST',
                body: user
            });
            const status = await response.status;
            const data = await response.json();
            if (status >=200 && status<300) {

            } else {
                if (data.error) {
                    throw new Error(data.error);
                } else {
                    throw new Error('Error registering user');
                }

            }
        } catch(err) {

        }

    }
}

export function errorHandler(dispatch, error, type) {
}

export function loginUser({ email, password }) {
  return function(dispatch) {
    axios.post(`${config.API_URL}/auth/login`, { email, password })
    .then(response => {
      cookie.save('token', response.data.token, { path: '/' });
      dispatch({ type: AUTH_USER });
      window.location.href = CLIENT_ROOT_URL + '/dashboard';
    })
    .catch((error) => {
      errorHandler(dispatch, error.response, AUTH_ERROR)
    });
    }
  }

export function registerUser({ email, firstName, lastName, password }) {
  return function(dispatch) {
    axios.post(`${API_URL}/auth/register`, { email, firstName, lastName, password })
    .then(response => {
      cookie.save('token', response.data.token, { path: '/' });
      dispatch({ type: AUTH_USER });
      window.location.href = CLIENT_ROOT_URL + '/dashboard';
    })
    .catch((error) => {
      errorHandler(dispatch, error.response, AUTH_ERROR)
    });
  }
}

export function logoutUser() {
  return function (dispatch) {
    dispatch({ type: UNAUTH_USER });
    cookie.remove('token', { path: '/' });

    window.location.href = CLIENT_ROOT_URL + '/login';
  }
}

export function protectedTest() {
  return function(dispatch) {
    axios.get(`${API_URL}/protected`, {
      headers: { 'Authorization': cookie.load('token') }
    })
    .then(response => {
      dispatch({
        type: PROTECTED_TEST,
        payload: response.data.content
      });
    })
    .catch((error) => {
      errorHandler(dispatch, error.response, AUTH_ERROR)
    });
  }
}
