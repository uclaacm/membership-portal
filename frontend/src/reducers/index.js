import {createStore, combineReducers, applyMiddleware} from 'redux';
import createHistory from 'history/createBrowserHistory';
import {routerReducer, routerMiddleware, push} from 'react-router-redux';
import thunk from 'redux-thunk';

import {Health, TimeGet} from './health';
import {User, FetchUser, UpdateUser, UserUpdateDone} from './user';
import {Auth, LoginUser, LogoutUser} from './auth';
import {Events, GetCurrentEvents, PostNewEvent} from './events';

const history = createHistory();
const routing = routerMiddleware(history);

const store = createStore(
  combineReducers({
    Health,
    Auth,
    Events,
    User,
    router: routerReducer,
  }),
  applyMiddleware(routing, thunk)
);

const Action = {
  TimeGet, LoginUser, LogoutUser, GetCurrentEvents, FetchUser, UpdateUser, UserUpdateDone, PostNewEvent,
};

export {
  store, history, Action,
}
