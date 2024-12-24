import { NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import React from 'react';
import NavigationItem from './navigationItem';

export default class Topbar extends React.Component {
  render() {
    const { isAdmin } = this.props;

    return (
      <div className="topbar">
        {
          /* USER NAVIGATION */ !isAdmin && (
            <div className="topbar-container">
              <NavLink to="/events" activeClassName="selected">
                <NavigationItem icon="fa-calendar" text="Events" />
              </NavLink>
              <NavLink to="/profile" activeClassName="selected">
                <NavigationItem icon="fa-user" text="Profile" />
              </NavLink>
              <NavLink to="/leaderboard" activeClassName="selected">
                <NavigationItem icon="fa-list" text="Leaderboard" />
              </NavLink>
              <NavLink to="/resources" activeClassName="selected">
                {' '}
                <NavigationItem icon="fa-file" text="Resources" />
              </NavLink>
            </div>
      )
        }

        {
          /* ADMIN NAVIGATION */ isAdmin && (
            <div className="topbar-container">
              <NavLink to="/events" activeClassName="selected">
                <NavigationItem icon="fa-calendar" text="Events" />
              </NavLink>
              <NavLink to="/leaderboard" activeClassName="selected">
                <NavigationItem icon="fa-list" text="Members" />
              </NavLink>
              <NavLink to="/resources" activeClassName="selected">
                {' '}
                <NavigationItem icon="fa-building" text="Organization" />
              </NavLink>
              <NavLink to="/controlpanel" activeClassName="selected">
                {' '}
                <NavigationItem icon="fa-gamepad fa-2x" text="Control Panel" />
              </NavLink>
            </div>
      )
        }
      </div>
    );
  }
}

Topbar.propTypes = {
  isAdmin: PropTypes.bool.isRequired, // Ensure 'isAdmin' is a required boolean
};
