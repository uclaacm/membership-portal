import React from 'react';

import Config from 'config';
import Topbar from 'components/Topbar';
import Sidebar from 'components/Sidebar';
import Profile from './profile';

export default class ProfileComponent extends React.Component {
    render () {
        const profile = {
            name: "Vic Yeh",
            major: "Computer Science",
            year: "4",
            points: 120
        };

        return (
            <div className="profile">
                <Topbar />
                <Sidebar/>
                <Profile profile={ profile } />
            </div>
        );
    }
}