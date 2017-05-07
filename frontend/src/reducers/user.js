import Immutable from 'immutable';

import Config from 'config';

const FETCH_USER = Symbol('FETCH_USER');
const LOGOUT_USER = Symbol('LOGOUT_USER');
const FETCH_USER_ERR = Symbol('FETCH_USER_ERR');
const REGISTER_USER_ERR = Symbol('REGISTER_USER_ERR');

const defaultState = Immutable.fromJS({
    'authenticated' : false,
    'user': {
        'firstName': '',
        'lastName': '',
        'picture': '',
        'email': '',
        'year': 0,
        'major': '',
        'points': 0,
    }
});

const fetchUserError = (err) => {
    return ({
        type: FETCH_USER_ERR,
        err
    });
}

const registerUserError = (err) => {
    return ({
        type: REGISTER_USER_ERR,
        err
    });
}

function fetchUser(token) {

    return async (dispatch) => {
        dispatch({
            type: FETCH_USER
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
            dispatch(fetchUserError(err.message));
        }
    }
}



const initialState = () => defaultState;

export default function (state=initialState(), action) {
    switch(action.type) {

        case FETCH_USER:
            return state.withMutations(val => {
                val.set('authenticated', true);
            });

        case LOGOUT_USER:
            return state.withMutations(val => {
                val.set('authenticated', false);
            });

        default:
            return state;
    }
}
