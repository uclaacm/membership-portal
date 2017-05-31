import Immutable from 'immutable';

import Config from 'config';

const FETCH_USER = Symbol('FETCH_USER');
const FETCH_USER_ERR = Symbol('FETCH_USER_ERR');

const defaultState = Immutable.fromJS({
    profile: {},
    fetchsuccess: false,
    error: ''
});

const fetchUserAction = (user) => {
    return ({
        type: FETCH_USER,
        user
    });
}

const fetchUserError = (error) => {
    return ({
        type: FETCH_USER_ERR,
        error
    });
}

const FetchUser = () => {

    return async (dispatch) => {
        try {
            const response = await fetch(Config.API_URL + Config.routes.user, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem("token")}`
                }
            });
            const status = await response.status;
            if (status >=200 && status<300) {
                const data = await response.json();
                dispatch(fetchUserAction(data.user));
            } else {
                throw new Error('Could not get user from api server');
            }
        } catch (err) {
            dispatch(fetchUserError(err.message));
        }
    }
}

const initialState = () => defaultState;

const User = (state=initialState(), action) => {
    switch(action.type) {

        case FETCH_USER:
            return state.withMutations(val => {
                val.set('profile', action.user);
                val.set('fetchsuccess', true);
                val.set('error', '');
            });

        case FETCH_USER_ERR:
            return state.withMutations(val => {
                val.set('error', action.error);
                val.set('profile', {});
                val.set('fetchsuccess', false);
            })

        default:
            return state;
    }
}

export { User, FetchUser}
