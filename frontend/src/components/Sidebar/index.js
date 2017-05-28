import React, { PropTypes } from 'react';

import Config from 'config';
import Organization from './organization';
import Points from './points';
import Username from './username';
import ProfilePicture from './profilePicture';
import Navigation from './navigation';

class Sidebar extends React.Component {
    render () {
        return(
            <div className="sidebar">
                <div className="sidebar-container">
                    <ProfilePicture pic="https://media.licdn.com/mpr/mpr/shrinknp_200_200/AAEAAQAAAAAAAAeeAAAAJDU1OGQ3NGZhLTY1MjgtNGYzNS1iMDc5LTliODhlMzg1NjJmMw.jpg"/>
                    <Organization org="UCLA ACM" />
                    <Username username="Vic Yeh" />
                    <Navigation/>
                    <Points levelClass="Hacker" levelNumber="2" points="10" />
                </div>
            </div>
        )
    }
}

export default Sidebar;
