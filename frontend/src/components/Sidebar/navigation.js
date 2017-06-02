import React from 'react';
import { connect } from 'react-redux';
import NavigationTile from './navigationTile';

class Navigation extends React.Component {
    render() {
        return (
            <div>
            { /* USER NAVIGATION */ !this.props.isAdmin && 
                <div className="navigation">
                    <a href="/events" className="no-style"><NavigationTile icon="fa-calendar fa-2x" text="Events" selected={ this.props.isEventsPage } /></a>
                    <a href="/profile" className="no-style"><NavigationTile icon="fa-user fa-2x" text="Profile" selected={ this.props.isProfilePage } /></a>
                    <a href="/leaderboard" className="no-style"><NavigationTile icon="fa-list fa-2x" text="Leaderboard"  selected={ this.props.isLeaderboardPage }/></a>
                    <a href="/resources" className="no-style"> <NavigationTile icon="fa-file fa-2x" text="Resources"  selected={ this.props.isResourcesPage }/></a>
                </div>
            }
            { /* ADMIN NAVIGATION */ this.props.isAdmin &&
                <div className="navigation">
                    <a href="/events" className="no-style"><NavigationTile icon="fa-calendar fa-2x" text="Events" selected={ this.props.isEventsPage } /></a>
                    <a href="/leaderboard" className="no-style"><NavigationTile icon="fa-users fa-2x" text="Members"  selected={ this.props.isLeaderboardPage }/></a>
                    <a href="/resources" className="no-style"> <NavigationTile icon="fa-building-o fa-2x" text="Organization"  selected={ this.props.isResourcesPage }/></a>
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

export default connect(mapStateToProps, null)(Navigation);