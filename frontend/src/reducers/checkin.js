import Immutable from 'immutable';
import Config from 'config';

const CHECK_IN_SUCCESS = Symbol('CHECK_IN');
const CHECK_IN_ERROR = Symbol('CHECK_IN_ERROR');

const checkInSuccess = (points) => {
    return({
        type: CHECK_IN_SUCCESS,
        points
    });
}

const checkInFailure = (error) => {
    return({
        type: CHECK_IN_ERROR,
        error
    });
}

const CheckInto = (id) => {
    return async (dispatch) => {
        try {
            //TODO: implement this?
            // Dummy behavior
            dispatch(checkInSuccess(10));
        } catch (err) {
            dispatch(checkInFailure());
        }
    }
}

defaultState = Immutable.fromJs({
    loading: false,
    success: false,
    numPoints: 0,
    error: ''
});

const initState = () => {

    return defaultState;
}

const CheckIn = (state=initState(), action) => {
    switch(action.type) {
        case CHECK_IN_SUCCESS:
            return state.withMutations(val => {
                val.set('loading', false);
                val.set('success', true);
                val.set('numPoints', action.points);
            });

        case CHECK_IN_ERROR:
            return defaultState.withMutations(val => {
                val.set('error': action.error);
            });

        default:
            return state;
    }
}

export {
    CheckIn, CheckInto
}
