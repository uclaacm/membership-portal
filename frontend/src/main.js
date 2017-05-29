import 'main.scss';

import 'babel-polyfill';
import 'whatwg-fetch';

import React from 'react';
import {Provider, createStore} from 'react-redux';
import {Route, Switch, Redirect} from 'react-router-dom';
import {ConnectedRouter} from 'react-router-redux';
import {render} from 'react-dom';

import {store, history} from 'reducers';

import Events from 'containers/events';
import About from 'containers/about';
import Login from 'containers/login';
import Profile from 'containers/profile';
import Leaderboard from 'containers/leaderboard';
import Resources from 'containers/resources';

import Register from 'components/Register';

//for redirect routes that require Authentication
import requireAuth from 'containers/requireAuth';

class App extends React.Component {
	render(){
		return (<Provider store={store}>
			<ConnectedRouter history={history}>
				<div>
					 <Switch>
						 <Route exact path="/" component={requireAuth(Events)}/>
						 <Route path="/about" component={About}/>
						 <Route path="/login" component={Login}/>
						 <Route path="/register" component={Register}/>
						 <Route path="/events" component={requireAuth(Events)}/>
						 <Route path="/profile" component={Profile}/>
						 <Route path="/leaderboard" component={Leaderboard}/>
						 <Route path="/resources" component={Resources}/>
						 <Redirect to="/"/>
					 </Switch>

				</div>
			</ConnectedRouter>
		</Provider>);

	}
}

render(<App />, document.getElementById('mount'));