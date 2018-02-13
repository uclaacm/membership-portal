import React from 'react';
import { NavLink } from 'react-router-dom';
import NavigationTile from './navigationTile';

export default class Navigation extends React.Component {
	render() {
		return (
			<div>
			{ /* USER NAVIGATION */ !this.props.isAdmin && 
				<div className="navigation">
					<NavLink to="/events" activeClassName="selected"><NavigationTile icon="fa-calendar fa-2x" text="Events" /></NavLink>
					<NavLink to="/profile" activeClassName="selected"><NavigationTile icon="fa-user fa-2x" text="Profile" /></NavLink>
					<NavLink to="/leaderboard" activeClassName="selected"><NavigationTile icon="fa-list fa-2x" text="Leaderboard" /></NavLink>
					<NavLink to="/resources" activeClassName="selected"><NavigationTile icon="fa-file fa-2x" text="Resources" /></NavLink>
				</div>
			}
			{ /* ADMIN NAVIGATION */ this.props.isAdmin &&
				<div className="navigation">
					<NavLink to="/events" activeClassName="selected"><NavigationTile icon="fa-calendar fa-2x" text="Events" /></NavLink>
					<NavLink to="/leaderboard" activeClassName="selected"><NavigationTile icon="fa-users fa-2x" text="Members" /></NavLink>
					<NavLink to="/resources" activeClassName="selected"> <NavigationTile icon="fa-building-o fa-2x" text="Organization" /></NavLink>
					<NavLink to="/controlpanel" activeClassName="selected"> <NavigationTile icon="fa-gamepad fa-2x" text="Control Panel" /></NavLink>
				</div>
			}
			</div>
		);
	}
}
