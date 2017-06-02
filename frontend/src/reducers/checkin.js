import Config from 'config';
import Immutable from 'immutable';

const CHECK_IN_SUCCESS = Symbol('CHECK_IN');
const CHECK_IN_ERROR = Symbol('CHECK_IN_ERROR');

const checkInSuccess = (points) => {
    return {
        type: CHECK_IN_SUCCESS,
        points
    };
}

const checkInFailure = (error) => {
    return {
        type: CHECK_IN_ERROR,
        error
    };
}

const CheckInto = (id) => {
    return async (dispatch) => {
        try {
            //TODO: implement this?
            // Dummy behavior
            console.log(`got id: ${id}`);
            const response = await fetch(Config.API_URL + Config.routes.attendance.attend, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({"event": {"attendanceCode": id}})
            });

            const status = await response.status;
            const data = await response.json();

            if (!data)
				throw new Error("Empty response from server");
			if (data.error)
				throw new Error(data.error.message);

            const pointsEarned = data.event.attendancePoints;
            console.log(`points!: ${pointsEarned}`);
            dispatch(checkInSuccess(attendancePoints));
        } catch (err) {
            dispatch(checkInFailure());
        }
    }
}

const defaultState = Immutable.fromJS({
    loading: false,
    success: false,
    numPoints: 0,
    error: ''
});

const CheckIn = (state=defaultState, action) => {
    switch(action.type) {
        case CHECK_IN_SUCCESS:
            return state.withMutations(val => {
                val.set('loading', false);
                val.set('success', true);
                val.set('numPoints', action.points);
            });

        case CHECK_IN_ERROR:
            return defaultState.withMutations(val => {
                val.set('error', action.error);
            });

        default:
            return state;
    }
}

export {
    CheckIn, CheckInto
}
