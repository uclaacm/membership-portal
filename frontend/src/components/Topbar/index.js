import React from 'react';
import { connect } from 'react-redux';
import { NavLink } from 'react-router-dom';

import NavigationItem from './navigationItem';

export default class Topbar extends React.Component {
	render() {
		return (
			<div className="topbar">
				{ /* USER NAVIGATION */ !this.props.isAdmin &&
				<div className="topbar-container">
					<NavLink to="/events" activeClassName="selected"><NavigationItem icon="fa-calendar" text="Events" /></NavLink>
					<NavLink to="/profile" activeClassName="selected"><NavigationItem icon="fa-user" text="Profile" /></NavLink>
					<NavLink to="/leaderboard" activeClassName="selected"><NavigationItem icon="fa-list" text="Leaderboard" /></NavLink>
					<NavLink to="/resources" activeClassName="selected"> <NavigationItem icon="fa-file" text="Resources" /></NavLink>
				</div>
				}

				{ /* ADMIN NAVIGATION */ this.props.isAdmin &&
				<div className="topbar-container">
					<NavLink to="/events" activeClassName="selected"><NavigationItem icon="fa-calendar" text="Events" /></NavLink>
					<NavLink to="/leaderboard" activeClassName="selected"><NavigationItem icon="fa-list" text="Members" /></NavLink>
					<NavLink to="/resources" activeClassName="selected"> <NavigationItem icon="fa-building-o" text="Organization" /></NavLink>
				</div>
				}
			</div>
		);
	}
}
