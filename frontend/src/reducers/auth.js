import Config from 'config';
import Immutable from 'immutable';

import { replace } from 'react-router-redux';

const setStorage = (key,item) => localStorage.setItem(key, item);
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
    return tokenGetClaims(token).admin;
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
    dispatch({ type: USER_GET });
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
      const data = await response.json();

      if(!data) {
        throw new Error("Empty response from server");
      } else if(data.error){
        throw new Error(data.error.message);
      }
      setStorage("token", data.token);
      dispatch(AuthUser(tokenIsAdmin(data.token)));
    } catch (err) {
      dispatch(AuthUserError(err.message));
    }
  };
}

const LogoutUser = (error) => {
    return async (dispatch) => {
        dispatch({
            type: UNAUTH_USER,
            payload: error || ''
        });
        removeFromStorage("token");
        dispatch(replace('/login'));
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
    if (localStorage.getItem("token")) {
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
