import React from 'react';
import {connect} from 'react-redux';

import moment from 'moment';

import Config from 'config';
import {Action} from 'reducers';
//import Sidebar from 'components/Sidebar'
import Dashboard from 'components/Dashboard'

class Home extends React.Component {

    handleGetEvents() {
        this.props.fetchEvents();
    }

    componentWillMount() {
        if (this.props.authenticated) {
            this.props.fetchEvents();
        }
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
    const k = e.get('events');
    let eventDays = [];
    for(let i = 0; i < k.length; i++){
        const event = {
                "img": k[i].cover,
                "org": k[i].committee,
                "time": moment(k[i].startDate).format('h:mm a'),
                "title": k[i].title,
                "location": k[i].location,
                "description": k[i].description,
                "attendancePoints": k[i].attendancePoints
        };
        if(eventDays.length < 1 || moment(k[i].startDate).format('dddd, MMMM Do') !== eventDays[eventDays.length - 1].date){
            eventDays.push({
                "date": moment(k[i].startDate).format('dddd, MMMM Do'),
                "events": [event]
            });
        } else {
            eventDays[eventDays.length - 1].events.push(event);
        }
    }
    return {
        events: eventDays,
        authenticated: state.Auth.get('authenticated'),
        error: e.get('error'),
    };
};

const mapDispatchToProps = (dispatch)=>{
    return {
        fetchEvents: () => {
            dispatch(Action.GetCurrentEvents());
        },

        getTime: (input)=>{
            dispatch(Action.TimeGet());
        },
    };
};


Home = connect(mapStateToProps, mapDispatchToProps)(Home);
export default Home
