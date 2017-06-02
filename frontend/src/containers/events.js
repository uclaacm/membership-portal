import React from 'react';
import {connect} from 'react-redux';

import moment from 'moment';

import Config from 'config';
import {Action} from 'reducers';
import Topbar from 'containers/topbar';
import Sidebar from 'containers/sidebar';
import UserEvents from 'components/Events/UserEvents'
import AdminEvents from 'components/Events/AdminEvents'

class Events extends React.Component {
	componentWillMount() {
		if (this.props.authenticated) {
			this.props.fetchEvents();
		}
	}

	render(){
		return (
			<div>
				<Topbar />
				<Sidebar />
				{ !this.props.isAdmin ? <UserEvents events={this.props.events} error={this.props.error} /> : 
				                        <AdminEvents events={this.props.events} error={this.props.error} createEvent={this.props.createEvent} created={this.props.eventCreated} createSuccess={this.props.eventCreateSuccess} /> }
			</div>
		);
	}
}

const mapStateToProps = (state)=>{
	const e = state.Events;

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
	};
};


Events = connect(mapStateToProps, mapDispatchToProps)(Events);
export default Events
