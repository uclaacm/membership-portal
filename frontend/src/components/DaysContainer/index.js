import React, { PropTypes } from 'react'

import SingleDay from '../SingleDay/';

class EventsList extends React.Component {
    render () {
        let k=[];
        return(
            <div>
                <SingleDay date="06/06/2017" event="Negotiate Offer" />
            </div>
        );
    }
}

export default EventsList;
