import React from 'react';
import { connect } from 'react-redux';

import Config from 'config';
import NavigationItem from './navigationItem';

class Topbar extends React.Component {
	render () {
		return (
			<div className="topbar">
				{ /* USER NAVIGATION */ !this.props.isAdmin &&
				<div className="topbar-container">
					<a href="/events" className="no-style"><NavigationItem icon="fa-calendar" text="Events" selected={ this.props.isEventsPage } /></a>
					<a href="/profile" className="no-style"><NavigationItem icon="fa-user" text="Profile" selected={ this.props.isProfilePage } /></a>
					<a href="/leaderboard" className="no-style"><NavigationItem icon="fa-list" text="Leaderboard"  selected={ this.props.isLeaderboardPage }/></a>
					<a href="/resources" className="no-style"> <NavigationItem icon="fa-file" text="Resources"  selected={ this.props.isResourcesPage }/></a>
				</div>
				}

				{ /* ADMIN NAVIGATION */ this.props.isAdmin &&
				<div className="topbar-container">
					<a href="/events" className="no-style"><NavigationItem icon="fa-calendar" text="Events" selected={ this.props.isEventsPage } /></a>
					<a href="/leaderboard" className="no-style"><NavigationItem icon="fa-list" text="Members"  selected={ this.props.isLeaderboardPage }/></a>
					<a href="/resources" className="no-style"> <NavigationItem icon="fa-building-o" text="Organization"  selected={ this.props.isResourcesPage }/></a>
				</div>
				}
			</div>
		);
	}
}

const mapStateToProps = (state) => {
	const R = state.router;
	return {
		isEventsPage: R.location.pathname.indexOf("/events") !== -1,
		isProfilePage: R.location.pathname.indexOf("/profile") !== -1,
		isLeaderboardPage: R.location.pathname.indexOf("/leaderboard") !== -1,
		isResourcesPage: R.location.pathname.indexOf("/resources") !== -1
	};
}

export default connect(mapStateToProps, null)(Topbar);