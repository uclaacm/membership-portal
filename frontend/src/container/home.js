import React from 'react';
import {connect} from 'react-redux';

import Config from 'config';


class Home extends React.Component {
  render(){
    return <div>
      {Config.info.msg}<br/>
      Path: {this.props.urlPath}<br/>
      <button onClick={()=>{this.props.printlog(Config.info.msg);}}>Print</button>
    </div>;
  }
}

const mapStateToProps = (state)=>{
  return {
    urlPath: state.router.location.pathname,
  };
};

const mapDispatchToProps = (dispatch)=>{
  return {
    printlog: (input)=>{
      console.log(input);
      // dispatch(action);
    },
  };
};


Home = connect(mapStateToProps, mapDispatchToProps)(Home);
export default Home
