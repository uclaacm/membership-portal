import React, { PropTypes } from 'react'

import EventsList from '../DaysContainer/';

class DashBoard extends React.Component {
    render () {
        return(
            <div className="dashboard">
                <EventsList/>
            </div>
        );
    }
}

export default DashBoard;
