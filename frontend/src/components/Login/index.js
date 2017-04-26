import React, { PropTypes } from 'react';

import Config from 'config';

import LoginSidebar from './loginSidebar';

class LoginComponent extends React.Component {
    render () {
        return(
            <div className="login">
                <LoginSidebar/>
            </div>
        )
    }
}

export default LoginComponent;
