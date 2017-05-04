import React, { PropTypes } from 'react';

import Config from 'config';

import NameConfirmCard from './nameConfirmCard';
import DetailsCard from './detailsCard';

class RegisterComponent extends React.Component {
    render () {
        return(
            <div className="register-component">
              {/*<NameConfirmCard name="Ram Goli"/>*/}
              <DetailsCard/>
            </div>
        )
    }
}

export default RegisterComponent;
