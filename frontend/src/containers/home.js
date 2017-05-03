import React from 'react';
import {connect} from 'react-redux';

import Config from 'config';
import {Action} from 'reducers';
import Sidebar from 'components/Sidebar'

class Home extends React.Component {
  render(){
    return <div>
      {/*<div>{Config.info.msg}</div>
      <div>Path: {this.props.urlPath}</div>
      <div>
        <button onClick={()=>{this.props.getTime(Config.info.msg);}}>Get Time</button>
        {this.props.loading && <span>Loading</span>}
        {!this.props.loading && this.props.success && <span>Time: {this.props.time}</span>}
        {!this.props.loading && this.props.err && <span>Time: Error({this.props.err})</span>}
      </div>*/}
        <Sidebar/>
    </div>;

  }
}

const mapStateToProps = (state)=>{
  const h = state.Health;
  return {
    loading: h.get('loading'),
    success: h.get('success'),
    time: h.get('time'),
    err: h.get('err'),
    urlPath: state.router.location.pathname,
  };
};

const mapDispatchToProps = (dispatch)=>{
  return {
    getTime: (input)=>{
      console.log(input);
      dispatch(Action.TimeGet());
    },
  };
};


Home = connect(mapStateToProps, mapDispatchToProps)(Home);
export default Home
