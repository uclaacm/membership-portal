import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import './profileDropdown.scss';

export default class ProfileDropdown extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
    };
    this.wrapperRef = React.createRef();
    this.toggleDropdown = this.toggleDropdown.bind(this);
    this.handleClickOutside = this.handleClickOutside.bind(this);
  }

  componentDidMount() {
    document.addEventListener('mousedown', this.handleClickOutside);
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClickOutside);
  }

  handleClickOutside(event) {
    if (this.wrapperRef.current && !this.wrapperRef.current.contains(event.target)) {
      this.setState({ isOpen: false });
    }
  }

  toggleDropdown() {
    this.setState(prev => ({ isOpen: !prev.isOpen }));
  }

  render() {
    const {
      picture, isAdmin, adminView, onToggleAdminView,
    } = this.props;
    const { isOpen } = this.state;

    return (
      <div className="profile-dropdown" ref={this.wrapperRef}>
        <div className="profile-dropdown-trigger" onClick={this.toggleDropdown}>
          <img
            src={picture || '/assets/images/unknown.png'}
            alt="Profile"
            className="profile-avatar"
          />
          <i className={`fa fa-chevron-${isOpen ? 'up' : 'down'}`} />
        </div>

        {isOpen && (
          <div className="profile-dropdown-menu">
            <Link to="/profile" className="dropdown-item" onClick={this.toggleDropdown}>
              <i className="fa fa-user" />
              <span>My Profile</span>
            </Link>
            <Link to="/profile/career" className="dropdown-item" onClick={this.toggleDropdown}>
              <i className="fa fa-briefcase" />
              <span>Career Profile</span>
            </Link>
            {isAdmin && (
              <>
                <div className="dropdown-divider" />
                <button className="dropdown-item" onClick={onToggleAdminView}>
                  <i className="fa fa-toggle-on" />
                  <span>{adminView ? 'Member View' : 'Admin View'}</span>
                </button>
              </>
            )}
            <div className="dropdown-divider" />
            <button className="dropdown-item dropdown-item-signout" onClick={this.props.onLogout}>
              <i className="fa fa-sign-out-alt" />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </div>
    );
  }
}

ProfileDropdown.propTypes = {
  picture: PropTypes.string,
  onLogout: PropTypes.func.isRequired,
  isAdmin: PropTypes.bool,
  adminView: PropTypes.bool,
  onToggleAdminView: PropTypes.func,
};

ProfileDropdown.defaultProps = {
  picture: null,
  isAdmin: false,
  adminView: false,
  onToggleAdminView: () => {},
};
