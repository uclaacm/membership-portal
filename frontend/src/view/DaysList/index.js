import React, { PropTypes } from 'react'

import SingleDay from '../SingleDay/index';

class EventsList extends React.Component {
    render () {
        let k=[];
        return(
            <div>
                <SingleDay date="06/06/2017" />
            </div>
        );
    }
}

export default EventsList;
