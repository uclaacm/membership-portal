import React, { PropTypes } from 'react';
import Config from 'config';
import NavigationItem from './navigationItem';

class Sidebar extends React.Component {
    render () {
        return (
            <div className="topbar">
                <div className="topbar-container">
                    <NavigationItem icon="fa-calendar" text="Events" />
                    <NavigationItem icon="fa-user" text="Profile" />
                    <NavigationItem icon="fa-list" text="Leaderboard" />
                    <NavigationItem icon="fa-file" text="Resources" />
                </div>
            </div>
        );
    }
}

export default Sidebar;
