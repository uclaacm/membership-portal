import React from 'react';
import {NavLink} from 'react-router-dom';

import Config from 'config';


class Navbar extends React.Component {
  render(){
    let k = [];
    for(let [name, url] of Config.nav){
      k.push(<li><NavLink to={url} activeClassName="active">{name}</NavLink></li>);
    }
    return <div>
      <ul>
        {k}
      </ul>
    </div>;
  }
}


export default Navbar
