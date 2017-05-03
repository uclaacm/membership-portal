import React, { PropTypes } from 'react';

import Config from 'config';

import LoginSidebar from './loginSidebar';

class LoginComponent extends React.Component {
    render () {
        return(
            <div className="login">
                <LoginSidebar className="login-tile"/>
                <p className="login-tile">There is other content and images that go here
                    There's also an issue with making the div the full height :( @kevin pls help
                    <br></br>
                    Essentially 100vh works but it kind of breaks other things when scrolling.

                </p>
            </div>
        )
    }
}

export default LoginComponent;
