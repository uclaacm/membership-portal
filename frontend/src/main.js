import 'main.scss';

import React from 'react';
import {BrowserRouter as Router, Route, Link} from 'react-router-dom'
import {render} from 'react-dom';

import Config from 'config';


class App extends React.Component {
  render(){
    return <div>
      {Config.info.msg}
    </div>;
  }
}

render(
  <App />,
  document.getElementById('mount')
);
