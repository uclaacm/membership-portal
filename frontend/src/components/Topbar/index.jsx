import { NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import React from 'react';
import NavigationItem from './navigationItem';
import Config from 'config';
import './style.scss';

export default class Topbar extends React.Component {
  constructor(props) {
    super(props);
    this.state = { menuOpen: false };
    this.toggleMenu = this.toggleMenu.bind(this);
  }

  componentDidMount() {
    window.addEventListener('resize', this.handleResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }

  handleResize = () => {
    if (window.innerWidth > 768 && this.state.menuOpen) {
      this.setState({ menuOpen: false });
    }
  };

  toggleMenu() {
    this.setState(prev => ({ menuOpen: !prev.menuOpen }));
  }

  render() {
    const { isAdmin } = this.props;
    const { menuOpen } = this.state;
    
    const sharedLinks = (
      <>
        <NavLink to="/home" activeClassName="selected">
          <NavigationItem icon="fa-user" text="Home" />
        </NavLink>
        <NavLink to="/events" activeClassName="selected">
          <NavigationItem icon="fa-calendar" text="Events" />
        </NavLink>
        <NavLink to="/leaderboard" activeClassName="selected">
          <NavigationItem icon="fa-list" text={isAdmin ? 'Members' : 'Leaderboard'} />
        </NavLink>
        <NavLink to="/resources" activeClassName="selected">
          <NavigationItem icon={isAdmin ? 'fa-building' : 'fa-file'} text={isAdmin ? 'Organization' : 'Resources'} />
        </NavLink>
      </>
    );

    return (
      <div className="topbar">
        <div className="topbar-container">
          <div className="topbar-logo">
            <img src="/assets/images/new_acm_wordmark_chapter.png" alt={Config.organization.name} />
          </div>

          <div className={`topbar-links ${menuOpen ? 'open' : ''}`}>
            {sharedLinks}

            {/* Add Control Panel for Admins */}
            {isAdmin && (
              <NavLink to="/controlpanel" activeClassName="selected">
                <NavigationItem icon="fa-gamepad fa-2x" text="Control Panel" />
              </NavLink>
            )}

            {/* Add Profile Link (Mobile only) */}
            {!isAdmin && (
              <NavLink to="/profile" className="topbar-profile-mobile navigation-item" activeClassName="selected">
                <NavigationItem icon="fa-user-circle" text="Profile" />
              </NavLink>
            )}
          </div>

          {/* Hamburger Button (Mobile only) */}
          <div className={`hamburger ${menuOpen ? 'open' : ''}`} onClick={this.toggleMenu}>
            <i className={`fa ${menuOpen ? 'fa-times' : 'fa-bars'}`} />
          </div>

          {/* Profile Icon (Desktop only) */}
          {!isAdmin && (
            <NavLink to="/profile" className="topbar-profile desktop-only" activeClassName="selected">
              <img src={this.props.picture ? this.props.picture : "/assets/images/unknown.png"} alt="Profile" />
            </NavLink> 
          )}
        </div>
      </div>
    );
  }
}

Topbar.propTypes = {
  isAdmin: PropTypes.bool.isRequired,
};
