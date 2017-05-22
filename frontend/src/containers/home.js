import React from 'react';
import {connect} from 'react-redux';

import Config from 'config';
import {Action} from 'reducers';
//import Sidebar from 'components/Sidebar'
import Dashboard from 'components/Dashboard'

class Home extends React.Component {

    handleGetEvents() {
        this.props.fetchEvents();
    }

    componentWillMount() {
        this.props.fetchEvents();
    }

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
        <Dashboard fetchEvents={this.handleGetEvents.bind(this)}
                    events={this.props.events}
                    error={this.props.error} />
    </div>;

  }
}

const mapStateToProps = (state)=>{
    const e = state.Events;
    return {
        events: e.get('events'),
        error: e.get('error'),
    };
};

const mapDispatchToProps = (dispatch)=>{
    return {
        fetchEvents: () => {
            dispatch(Action.GetCurrentEvents());
        },

        getTime: (input)=>{
            console.log(input);
            dispatch(Action.TimeGet());
        },
    };
};


Home = connect(mapStateToProps, mapDispatchToProps)(Home);
export default Home
