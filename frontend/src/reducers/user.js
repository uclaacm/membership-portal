import Immutable from 'immutable';

import Config from 'config';

const FETCH_USER = Symbol('FETCH_USER');
const FETCH_USER_ERR = Symbol('FETCH_USER_ERR');

const defaultState = Immutable.fromJS({
    profile: {},
    message: '',
    error: ''
});

const fetchUser = (payload) => {
    return ({
        type: FETCH_USER,
        payload
    });
}

const fetchUserError = (err) => {
    return ({
        type: FETCH_USER_ERR,
        err
    });
}

function fetchUser(token) {

    return async (dispatch) => {
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
                dispatch(fetchUser(data));
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
                val.set('profile', action.payload);
            });

        case FETCH_USER_ERR:
            return state.withMutations(val => {
                val.set('error', action.payload);
            })

        default:
            return state;
    }
}
