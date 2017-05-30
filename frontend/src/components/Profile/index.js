import React from 'react';

import Config from 'config';
import Topbar from 'components/Topbar';
import Sidebar from 'containers/sidebar';
import Profile from './profile';

export default class ProfileComponent extends React.Component {
    render () {

        return (
            <div className="profile">
                <Topbar />
                <Sidebar/>
                <Profile profile={ this.props.profile } saveChanges = {this.props.saveChanges}/>
            </div>
        );
    }
}
