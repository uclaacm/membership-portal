import React from 'react';

import Config from 'config';


class Home extends React.Component {
  render(){
    return <div>
      {Config.info.msg}
    </div>;
  }
}


export default Home
