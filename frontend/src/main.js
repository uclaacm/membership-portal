import 'main.scss';

import React from 'react';
import {BrowserRouter as Router, Route, Switch, Redirect} from 'react-router-dom';
import {render} from 'react-dom';

import Home from 'container/home';
import About from 'container/about';

class App extends React.Component {
  render(){
    return <Router>
      <Switch>
        <Route exact path="/" component={Home}/>
        <Route path="/about" component={About}/>
        <Redirect to="/"/>
      </Switch>
    </Router>;
  }
}

render(
  <App />,
  document.getElementById('mount')
);
