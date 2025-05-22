// DEPRECATED: This file is deprecated and will be removed in the future. The new landing page sidebar is now located in
// src/components/home/home.js.

import React from 'react';

import Config from 'config';
import Points from './points';
import Username from './username';
import Navigation from './navigation';
import Organization from './organization';
import ProfilePicture from './profilePicture';

export default class Sidebar extends React.Component {
  render() {
    const { isAdmin, isSuperAdmin, adminView } = this.props;

    // If an admin is in member view, show them the member sidebar
    const showAdminView = isAdmin && adminView;

    return (
      <div className="sidebar">
        <div className="sidebar-container">
          <ProfilePicture picture={showAdminView ? Config.organization.logo : this.props.picture} />
          <Organization org={Config.organization.shortName} />
          <Username
            username={
              isSuperAdmin && showAdminView
                ? 'Super Admin'
                : showAdminView
                  ? 'Admin'
                  : this.props.username
            }
          />
          <Navigation isAdmin={showAdminView} />
          {!showAdminView && <Points points={this.props.points} />}
        </div>
      </div>
    );
  }
}
