import { NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import React from 'react';
import NavigationItem from './navigationItem';
import ProfileDropdown from './ProfileDropdown';
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
        <NavLink to="/profile/career" activeClassName="selected">
          <NavigationItem icon="fa-briefcase" text="Career Hub" />
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

            {/* Mobile only items */}
            <NavLink to="/profile" exact className="topbar-mobile-only" activeClassName="selected">
              <NavigationItem icon="fa-user-circle" text="Profile" />
            </NavLink>
            
            {(this.props.isRealAdmin || this.props.isOfficer) && (
              <a className="topbar-mobile-only" onClick={this.props.isRealAdmin ? this.props.onToggleAdminView : this.props.onToggleOfficerView}>
                <div className="navigation-item">
                  <span>{this.props.isRealAdmin ? (this.props.adminView ? 'Member View' : 'Admin View') : (this.props.officerView ? 'Member View' : 'Officer View')}</span>
                </div>
              </a>
            )}
            
            <a className="topbar-mobile-only signout-link" onClick={this.props.onLogout}>
              <div className="navigation-item">
                <span>Sign Out</span>
              </div>
            </a>
          </div>

          {/* Hamburger Button (Mobile only) */}
          <div className={`hamburger ${menuOpen ? 'open' : ''}`} onClick={this.toggleMenu}>
            <i className={`fa ${menuOpen ? 'fa-times' : 'fa-bars'}`} />
          </div>

          {/* Profile Icon (Desktop only) */}
          <ProfileDropdown
              picture={this.props.picture} 
              onLogout={this.props.onLogout}
              isAdmin={this.props.isRealAdmin}
              adminView={this.props.adminView}
              onToggleAdminView={this.props.onToggleAdminView}
              isOfficer={this.props.isOfficer}
              officerView={this.props.officerView}
              onToggleOfficerView={this.props.onToggleOfficerView}
            />
        </div>
      </div>
    );
  }
}

Topbar.propTypes = {
  isAdmin: PropTypes.bool.isRequired,
  picture: PropTypes.string,
  onLogout: PropTypes.func.isRequired,
  isRealAdmin: PropTypes.bool,
  adminView: PropTypes.bool,
  onToggleAdminView: PropTypes.func,
  isOfficer: PropTypes.bool,
  officerView: PropTypes.bool,
  onToggleOfficerView: PropTypes.func,
};
