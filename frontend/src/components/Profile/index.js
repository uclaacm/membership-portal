import React from 'react';

import Config from 'config';
import Topbar from 'containers/topbar';
import Sidebar from 'containers/sidebar';
import Profile from './profile';

export default class ProfileComponent extends React.Component {
    render() {
        return (
            <div className="profile">
                <Topbar />
                <Sidebar/>
                <Profile updated={this.props.updated} updateSuccess={this.props.updateSuccess} updateError={this.props.updateError} profile={ this.props.profile } saveChanges={ this.props.saveChanges } logout={this.props.logout} />
            </div>
        );
    }
}
