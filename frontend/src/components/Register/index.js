import React, { PropTypes } from 'react';

import Config from 'config';

import Card from './card';

class RegisterComponent extends React.Component {
    render () {
        return(
            <div className="register-component">
              <Card/>
            </div>
        )
    }
}

export default RegisterComponent;
