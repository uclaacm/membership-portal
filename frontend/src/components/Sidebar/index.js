import React from "react";

import Config from "config";
import Points from "./points";
import Username from "./username";
import Navigation from "./navigation";
import Organization from "./organization";
import ProfilePicture from "./profilePicture";

export default class Sidebar extends React.Component {
  render() {
    return (
      <div className="sidebar">
        <div className="sidebar-container">
          <ProfilePicture picture={this.props.isAdmin ? Config.organization.logo : this.props.picture} />
          <Organization org={Config.organization.shortName} />
          <Username
            username={this.props.isSuperAdmin ? "Super Admin" : this.props.isAdmin ? "Admin" : this.props.username}
          />
          <Navigation isAdmin={this.props.isAdmin} />
          {!this.props.isAdmin && <Points points={this.props.points} />}
        </div>
      </div>
    );
  }
}
