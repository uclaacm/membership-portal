import 'main.scss';

import 'babel-polyfill';
import React from 'react';
import {Provider, createStore} from 'react-redux';
import {Route, Switch, Redirect} from 'react-router-dom';
import {ConnectedRouter} from 'react-router-redux';
import {render} from 'react-dom';

import {store, history} from 'reducers';

//import Navbar from 'view/navbar';
import Home from 'containers/home';
import About from 'containers/about';
import Login from 'containers/login';
import SideBar from 'components/Sidebar/sidebar';
import DashBoard from 'components/DashBoard/';
import Register from 'components/Register';

class App extends React.Component {
  render(){

    return (<Provider store={store}>
      <ConnectedRouter history={history}>
        <div>
          {/*<SideBar/>
          <DashBoard/>*/}
           <Switch>
             <Route exact path="/" component={Home}/>
             <Route path="/about" component={About}/>
             <Route path="/login" component={Login}/>
             <Route path="/register" component={Register}/>
             <Redirect to="/"/>
           </Switch>

        </div>
      </ConnectedRouter>
    </Provider>);

  }
}


// class App extends React.Component {
//   render(){
//     return (
//         <Provider store={store}>
//             <ConnectedRouter history={history}>
//                 <div>
//                     <SideBar/>
//                     <DashBoard/>
//                     {/*   <Switch>
//                         <Route exact path="/" component={Home}/>
//                         <Route path="/about" component={About}/>
//                         <Redirect to="/"/>
//                         </Switch>*/}
//                 </div>
//             </ConnectedRouter>
//         </Provider>);
//   }
// }

render(
  <App />,
  document.getElementById('mount')
);
