import React from 'react';

import Topbar from 'containers/topbar';
import Sidebar from 'containers/sidebar';
import Profile from './profile';

export default class ProfileComponent extends React.Component {
  render() {
    return (
      <div className="profile">
        <Topbar />
        {/*<Sidebar />*/}
        <Profile
          updated={this.props.updated}
          updateSuccess={this.props.updateSuccess}
          updateError={this.props.updateError}
          activityError={this.props.activityError}
          profile={this.props.profile}
          activity={this.props.activity}
          saveChanges={this.props.saveChanges}
          logout={this.props.logout}
          adminView={this.props.adminView}
          toggleAdminView={this.props.toggleAdminView}
          isAdmin={this.props.isAdmin}
        />
      </div>
    );
  }
}
