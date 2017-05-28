import React from 'react';
import Config from 'config';
import NavigationItem from './navigationItem';

export default class Topbar extends React.Component {
    render () {
        return (
            <div className="topbar">
                <div className="topbar-container">
                    <a href="/events" className="no-style"><NavigationItem icon="fa-calendar" text="Events" /></a>
                    <a href="/profile" className="no-style"><NavigationItem icon="fa-user" text="Profile" /></a>
                    <a href="/leaderboard" className="no-style"><NavigationItem icon="fa-list" text="Leaderboard" /></a>
                    <a href="/resources" className="no-style"> <NavigationItem icon="fa-file" text="Resources" /></a>
                </div>
            </div>
        );
    }
}