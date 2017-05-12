import {createStore, combineReducers, applyMiddleware} from 'redux';
import createHistory from 'history/createBrowserHistory';
import {routerReducer, routerMiddleware, push} from 'react-router-redux';
import thunk from 'redux-thunk';

import {Health, TimeGet} from './health';
import {Auth, LoginUser, LogoutUser} from './auth';

const history = createHistory();
const routing = routerMiddleware(history);

const store = createStore(
  combineReducers({
    Health,
    Auth,
    router: routerReducer,
  }),
  applyMiddleware(routing, thunk)
);

const Action = {
  TimeGet, LoginUser, LogoutUser
};

export {
  store, history, Action,
}
