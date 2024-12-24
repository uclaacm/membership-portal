import { NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import React from 'react';
import NavigationTile from './navigationTile';

export default class Navigation extends React.Component {
  render() {
    const { isAdmin } = this.props;
    return (
      <div>
        {
          /* USER NAVIGATION */ !isAdmin && (
            <div className="navigation">
              <NavLink to="/events" activeClassName="selected">
                <NavigationTile icon="fa-calendar fa-2x" text="Events" />
              </NavLink>
              <NavLink to="/profile" activeClassName="selected">
                <NavigationTile icon="fa-user fa-2x" text="Profile" />
              </NavLink>
              <NavLink to="/leaderboard" activeClassName="selected">
                <NavigationTile icon="fa-list fa-2x" text="Leaderboard" />
              </NavLink>
              <NavLink to="/resources" activeClassName="selected">
                <NavigationTile icon="fa-file fa-2x" text="Resources" />
              </NavLink>
            </div>
      )
        }
        {
          /* ADMIN NAVIGATION */ isAdmin && (
            <div className="navigation">
              <NavLink to="/events" activeClassName="selected">
                <NavigationTile icon="fa-calendar fa-2x" text="Events" />
              </NavLink>
              <NavLink to="/leaderboard" activeClassName="selected">
                <NavigationTile icon="fa-users fa-2x" text="Members" />
              </NavLink>
              <NavLink to="/resources" activeClassName="selected">
                {' '}
                <NavigationTile icon="fa-building fa-2x" text="Organization" />
              </NavLink>
              <NavLink to="/controlpanel" activeClassName="selected">
                {' '}
                <NavigationTile icon="fa-gamepad fa-2x" text="Control Panel" />
              </NavLink>
            </div>
      )
        }
      </div>
    );
  }
}

Navigation.propTypes = {
  isAdmin: PropTypes.bool.isRequired, // Ensure 'isAdmin' is a required boolean
};
