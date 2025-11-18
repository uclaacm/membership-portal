import 'main.scss';
import 'babel-polyfill';
import 'whatwg-fetch';

import React from 'react';
import { Provider, createStore } from 'react-redux';
import { Route, Switch, Redirect } from 'react-router-dom';
import { ConnectedRouter } from 'react-router-redux';
import { render } from 'react-dom';

import { store, history } from 'reducers';

import Home from 'containers/home';
import Events from 'containers/events';
import Login from 'containers/login';
import Register from 'containers/register';
import Profile from 'containers/profile';
import CareerProfile from 'containers/careerProfile';
import Leaderboard from 'containers/leaderboard';
import ControlPanel from 'containers/controlPanel';
import Resources from 'containers/resources';
import requireAuth from 'containers/requireAuth';

class App extends React.Component {
  render() {
    return (
      <Provider store={store}>
        <ConnectedRouter onUpdate={() => window.scrollTo(0, 0)} history={history}>
          <div>
            <Switch>
              <Route path="/login" component={Login} />
              <Route path="/register" component={requireAuth(Register)} />
              <Route path="/home" component={requireAuth(Home)} />
              <Route path="/events" component={requireAuth(Events)} />
              <Route path="/profile/career" component={requireAuth(CareerProfile)} />
              <Route path="/profile" component={requireAuth(Profile)} />
              <Route path="/resources" component={requireAuth(Resources)} />
              <Route path="/leaderboard" component={requireAuth(Leaderboard)} />
              <Route path="/controlpanel" component={requireAuth(ControlPanel)} />
              <Redirect to="/home" />
            </Switch>
          </div>
        </ConnectedRouter>
      </Provider>
    );
  }
}

render(<App />, document.getElementById('mount'));
