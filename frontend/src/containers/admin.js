import React from 'react';
import {connect} from 'react-redux';
import {replace} from 'react-router-redux';

import moment from 'moment';

import Config from 'config';
import {Action} from 'reducers';
import AdminEvents from 'components/Events/adminEvents';
import Topbar from 'components/Topbar';
import Sidebar from 'containers/sidebar';

class AdminDash extends React.Component {
  componentWillMount() {
    if(!this.props.isAdmin){
      this.props.redirectHome();
    } else if(this.props.authenticated) {
      this.props.fetchEvents();
    }
  }

  componentWillReceiveProps(nextProps) {
    if(!nextProps.authenticated || !nextProps.isAdmin){
      this.props.redirectHome();
    }
  }

  render(){
    return <div className="dashboard">
      <Topbar isAdmin={this.props.isAdmin} />
      <Sidebar isAdmin={this.props.isAdmin} />
      <AdminEvents events={this.props.events} error={this.props.error} createEvent={this.props.createEvent} created={this.props.eventCreated} createSuccess={this.props.eventCreateSuccess} />
    </div>;
  }
}

const mapStateToProps = (state)=>{
  const e = state.Events;

    // if(eventDays.length < 1 || moment(k[i].startDate).format('dddd, MMMM Do') !== eventDays[eventDays.length - 1].dateStr){
    //   eventDays.push({
    //     dateStr: moment(k[i].startDate).format('dddd, MMMM Do'),
    //     date: moment(k[i].startDate),
    //     events: [event]
    //   });
    // } else {
    //   eventDays[eventDays.length - 1].events.push(event);
    // }
  // }

  return {
    events: e.get('events'),
    error: e.get('error'),
    eventCreated: e.get('posted'),
    eventCreateSuccess: e.get('postSuccess'),
    authenticated: state.Auth.get('authenticated'),
    isAdmin: state.Auth.get('isAdmin'),
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
    redirectHome: ()=>{
      dispatch(replace('/'));
    },
    createEvent: (newEvent) => {
      dispatch(Action.PostNewEvent(newEvent));
    }
  };
};


AdminDash = connect(mapStateToProps, mapDispatchToProps)(AdminDash);
export default AdminDash
