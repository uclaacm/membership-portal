import React, { PropTypes } from 'react';
import NavigationTile from './navigationTile';

class Navigation extends React.Component {
    render () {
        return(
            <div className="navigation">
                <NavigationTile icon="fa-calendar fa-2x" text="Events"/>
                <NavigationTile icon="fa-user fa-2x" text="Profile"/>
                <NavigationTile icon="fa-list fa-2x" text="Leaderboard"/>
                <NavigationTile icon="fa-file fa-2x" text="Resources"/>
            </div>
        );
    }
}

export default Navigation;
