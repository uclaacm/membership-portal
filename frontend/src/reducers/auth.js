import Immutable from 'immutable';

import Config from 'config';

const setStorage = (kev,item) => {
    localStorage.setItem(key, item);
}

const getFromStorage = (key) => localStorage.getItem(key);

const removeFromStorage = (key) => localStorage.removeItem(key);

///////////////
/// ACTIONS ///
///////////////

const USER_GET = Symbol('USER_GET');
const AUTH_USER = Symbol('AUTH_USER');
const UNAUTH_USER = Symbol('UNAUTH_USER');
const AUTH_ERROR = Symbol('AUTH_ERROR');

const AuthUser = () => {
    return ({
        type: AUTH_USER
    });
}

const AuthUserError = err => {
    return {
        type: AUTH_ERROR,
        err
    }
}

const loginUser = (email, password) => {
    return async (dispatch) => {
        dispatch({
            type: USER_GET
        });
        try {
            const response = await (Config.routes.auth.login, {
                method: 'POST',
                body: {"password": password, "email": email}
            });
            const status = await response.status;
            if (status >= 200 && status < 300) {
                const data = await response.json();
                setStorage("token", data.token);
                dispatch(AUTH_USER);
                window.location.href = `${Config.CLIENT_ROOT_URL}/dashboard`;
            }
        } catch (err) {
            dispatch(AuthUserError("Could not log in user"));
        }
    }
}

const logoutUser = (error) => {
    return async (dispatch) => {
        dispatch({
            type: UNAUTH_USER,
            payload: error || ''
        });
        removeFromStorage("token");
        window.location.href = `${Config.CLIENT_ROOT_URL}/login`;
    }
}
/*
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
*/

///////////////
/// STATE ///
///////////////

const defaultState = Immutable.fromJS({
    error: '',
    message: '',
    content: '',
    authenticated: false
});

const initState = () => defaultState;

const Auth = (state=initState(), action) => {
    switch (action.type) {
        case AUTH_USER:
            return state.withMutations(val => {
                val.set('authenticated', true);
                val.set('error', '');
                val.set('message', '');
            });

        case UNAUTH_USER:
            return state.withMutations(val => {
                val.set('authenticated', false);
                val.set('error': action.payload);
            });

        case AUTH_ERROR:
            return state.withMutations(val => {
                val.set('error', action.payload);
            })
    }
}

export {
    Auth, loginUser, logoutUser
}
