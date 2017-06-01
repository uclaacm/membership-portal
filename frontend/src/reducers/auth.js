import Immutable from 'immutable';

import Config from 'config';

const setStorage = (key,item) => {
    localStorage.setItem(key, item);
}

const getFromStorage = (key) => localStorage.getItem(key);

const removeFromStorage = (key) => localStorage.removeItem(key);

const tokenGetClaims = (token)=>{
  const tokenArray = token.split('.');
  if(tokenArray.length !== 3){
    return false;
  }
  return JSON.parse(window.atob(tokenArray[1].replace('-', '+').replace('_', '/')));
};

const tokenIsAdmin = (token)=>{
  const t = tokenGetClaims(token);
  if(t.admin){
    return true;
  }
  return false;
};

///////////////
/// ACTIONS ///
///////////////

const USER_GET = Symbol('USER_GET');
const AUTH_USER = Symbol('AUTH_USER');
const UNAUTH_USER = Symbol('UNAUTH_USER');
const AUTH_ERROR = Symbol('AUTH_ERROR');

const AuthUser = (isAdmin) => {
    return ({
        type: AUTH_USER,
        isAdmin,
    });
}

const AuthUserError = err => {
    return {
        type: AUTH_ERROR,
        err
    }
}

const LoginUser = (email, password) => {
    return async (dispatch) => {
        dispatch({
            type: USER_GET
        });
        try {
            const response = await fetch(Config.API_URL + Config.routes.auth.login, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({"password": password, "email": email}),
            });
            const status = await response.status;
            if (status >= 200 && status < 300) {
                const data = await response.json();
                if (!data.error) {
                    setStorage("token", data.token);
                    dispatch(AuthUser(tokenIsAdmin(data.token)));
                } else {
                    throw new Error(data.error.message);
                }
            } else { //TODO: Better error messages!
                throw new Error("Could not log in");
            }
        } catch (err) {
            dispatch(AuthUserError(err.message));
        }
    }
}

const LogoutUser = (error) => {
    return async (dispatch) => {
        dispatch({
            type: UNAUTH_USER,
            payload: error || ''
        });
        removeFromStorage("token");
        window.location.href = `${Config.CLIENT_ROOT_URL}/login`;
    }
}

function registerUser(user) {
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
            dispatch(registerUserError(err.message));
        }
    }
}


///////////////
/// STATE ///
///////////////

const defaultState = Immutable.fromJS({
    error: '',
    message: '',
    content: '',
    authenticated: false,
    isAdmin: false,
});

const initState = () => {
    if(localStorage.getItem("token")) {
      return Immutable.fromJS({
        error: '',
        message: '',
        content: '',
        authenticated: true,
        isAdmin: tokenIsAdmin(localStorage.getItem("token")),
      });
    }
    return defaultState;
}

const Auth = (state=initState(), action) => {
    switch (action.type) {
        case AUTH_USER:
            return state.withMutations(val => {
                val.set('authenticated', true);
                val.set('error', '');
                val.set('message', '');
                val.set('isAdmin', action.isAdmin);
            });

        case UNAUTH_USER:
            return defaultState;

        case AUTH_ERROR:
            return state.withMutations(val => {
                val.set('error', action.err);
            });

        default:
            return state;
    }
}

export {
    Auth, LoginUser, LogoutUser
}
