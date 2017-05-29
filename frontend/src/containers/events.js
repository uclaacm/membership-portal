import React from 'react';
import {connect} from 'react-redux';

import moment from 'moment';

import Config from 'config';
import {Action} from 'reducers';
import EventsComponent from 'components/Events'

class Events extends React.Component {

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
        <EventsComponent fetchEvents={this.handleGetEvents.bind(this)}
                    events={this.props.events}
                    error={this.props.error} />
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


Events = connect(mapStateToProps, mapDispatchToProps)(Events);
export default Events
