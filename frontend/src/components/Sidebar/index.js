import React, { PropTypes } from 'react';

import Config from 'config';
import Organization from './organization';
import Points from './points';
import UserName from './userName';
import ProfilePicture from './profilePicture';
import Checkin from './checkin';
import Leaderboard from './leaderboard';
import Settings from './settings';

class SideBar extends React.Component {
    render () {
        return(
            <div className="sidebar">
                <Settings pic="http://www.freeiconspng.com/uploads/settings-icon-26.png"/>
                <ProfilePicture pic="https://media.licdn.com/mpr/mpr/shrinknp_200_200/AAEAAQAAAAAAAAeeAAAAJDU1OGQ3NGZhLTY1MjgtNGYzNS1iMDc5LTliODhlMzg1NjJmMw.jpg"/>
                <Organization org="UCLA ACM" />
                <UserName userName="Vic Yeh" />
                <Checkin/>
                <Points level="2" points="23" />

                <Leaderboard/>
            </div>
        )
    }
}

export default SideBar;
