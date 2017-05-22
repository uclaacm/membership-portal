import React, { PropTypes } from 'react';

import Config from 'config';

import Sidebar from '../Sidebar/sidebar';

class ProfileComponent extends React.Component {
    render () {
        return(
            <div className="profile">
                <Sidebar/>
            </div>
        )
    }
}

export default ProfileComponent;
