import React, { PropTypes } from 'react';

import Config from 'config';

import NameConfirmCard from './nameConfirmCard';
import DetailsCard from './detailsCard';
import UrlConfirmCard from './urlConfirmCard'

class RegisterComponent extends React.Component {
    render () {
        return(
            <div className="register-component">
                <UrlConfirmCard/>
              {/*<NameConfirmCard name="Ram Goli"/>
              <DetailsCard/>
              <DetailsCard type="confirm-details"/>*/}
            </div>
        )
    }
}

export default RegisterComponent;
