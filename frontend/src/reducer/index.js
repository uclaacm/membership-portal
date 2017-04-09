import {createStore, combineReducers, applyMiddleware} from 'redux';
import createHistory from 'history/createBrowserHistory';
import {routerReducer, routerMiddleware, push} from 'react-router-redux';

// import reducers from './reducers';


const history = createHistory();
const middleware = routerMiddleware(history);

const store = createStore(
  combineReducers({
    // ...reducers,
    router: routerReducer,
  }),
  applyMiddleware(middleware)
);


export {
  store, history,
}
