import React from 'react';

import Config from 'config';
import Topbar from '../Topbar';
import Sidebar from '../Sidebar';

export default class ProfileComponent extends React.Component {
    render () {
        return(
            <div className="profile">
                <Topbar />
                <Sidebar/>
            </div>
        )
    }
}