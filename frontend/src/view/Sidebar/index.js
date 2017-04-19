import React, { PropTypes } from 'react';

import Config from 'config';
import Organization from './organization';
import Points from './points';
import UserName from './userName';

class Sidebar extends React.Component {
    render () {
        return(
            <div>
                <UserName userName="BOB" />
                <Organization org="ACM" />
                <Points points="23" />
            </div>
        )
    }
}

export default Sidebar;
