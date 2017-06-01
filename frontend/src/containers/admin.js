import React from 'react';
import {connect} from 'react-redux';
import {replace} from 'react-router-redux';

import moment from 'moment';

import Config from 'config';
import {Action} from 'reducers';
import AdminEvents from 'components/Events/adminEvents';

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
    return <div>
      <AdminEvents events={this.props.events} error={this.props.error} />
    </div>;
  }
}

const mapStateToProps = (state)=>{
  const e = state.Events;
  const k = e.get('events');
  let eventDays = [];

  for (let i = 0; i < k.length; i++) {
    const event = {
      cover: k[i].cover,
      committee: k[i].committee,
      startDate: moment(k[i].startDate),
      endDate: moment(k[i].endDate),
      eventLink: k[i].eventLink,
      title: k[i].title,
      location: k[i].location,
      description: k[i].description,
      attendancePoints: k[i].attendancePoints
    };

    if(eventDays.length < 1 || moment(k[i].startDate).format('dddd, MMMM Do') !== eventDays[eventDays.length - 1].dateStr){
      eventDays.push({
        dateStr: moment(k[i].startDate).format('dddd, MMMM Do'),
        date: moment(k[i].startDate),
        events: [event]
      });
    } else {
      eventDays[eventDays.length - 1].events.push(event);
    }
  }

  return {
    events: eventDays,
    authenticated: state.Auth.get('authenticated'),
    error: e.get('error'),
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
  };
};


AdminDash = connect(mapStateToProps, mapDispatchToProps)(AdminDash);
export default AdminDash
