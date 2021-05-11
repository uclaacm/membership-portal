import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import createHistory from 'history/createBrowserHistory';
import { routerReducer, routerMiddleware } from 'react-router-redux';
import thunk from 'redux-thunk';

import {
  User, FetchUser, UpdateUser, UserUpdateDone, FetchActivity,
} from './user';
import {
  Auth, LoginUser, LogoutUser, RequestResetPassword, ResetPassword, ResetPasswordDone,
} from './auth';
import {
  Events, GetCurrentEvents, PostNewEvent, UpdateEvent,
  DeleteEvent, UpdateEventDone, CreateEventDone,
} from './events';
import { Leaderboard, FetchLeaderboard, InvalidateLeaderboard } from './leaderboard';
import { CheckIn, CheckInto, ResetCheckIn } from './checkin';
import { Registration, RegisterUser, registerDone } from './registration';

const history = createHistory();
const routing = routerMiddleware(history);

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(
  combineReducers({
    Auth,
    Events,
    User,
    Leaderboard,
    CheckIn,
    Registration,
    router: routerReducer,
  }),
  composeEnhancers(applyMiddleware(routing, thunk)),
);

const Action = {
  LoginUser,
  LogoutUser,
  FetchUser,
  UpdateUser,
  UserUpdateDone,
  FetchActivity,
  RequestResetPassword,
  ResetPassword,
  ResetPasswordDone,
  GetCurrentEvents,
  PostNewEvent,
  UpdateEvent,
  DeleteEvent,
  CreateEventDone,
  UpdateEventDone,
  FetchLeaderboard,
  InvalidateLeaderboard,
  RegisterUser,
  registerDone,
  CheckInto,
  ResetCheckIn,
};

export {
  store, history, Action,
};
