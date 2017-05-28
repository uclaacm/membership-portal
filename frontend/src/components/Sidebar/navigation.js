import React from 'react';
import NavigationTile from './navigationTile';

export default class Navigation extends React.Component {
    render() {
        return (
            <div className="navigation">
                <a href="/events" className="no-style"><NavigationTile icon="fa-calendar fa-2x" text="Events"/></a>
                <a href="/profile" className="no-style"><NavigationTile icon="fa-user fa-2x" text="Profile"/></a>
                <a href="/leaderboard" className="no-style"><NavigationTile icon="fa-list fa-2x" text="Leaderboard"/></a>
                <a href="/resources" className="no-style"><NavigationTile icon="fa-file fa-2x" text="Resources"/></a>
            </div>
        );
    }
}