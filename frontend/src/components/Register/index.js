import React from 'react';
import Config from 'config';

import DetailsCard from './detailsCard';
import NameConfirmCard from './nameConfirmCard';
import UrlConfirmCard from './urlConfirmCard'

export default class RegisterComponent extends React.Component {
    render () {
        return(
            <div className="register-component">
                {/*<UrlConfirmCard/>*/}
              {/*<NameConfirmCard name="Ram Goli"/>*/}
              <DetailsCard/>
              {/*<DetailsCard type="confirm-details"/>*/}
            </div>
        )
    }
}