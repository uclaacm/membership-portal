import React, { PropTypes } from 'react'

import DaysList from '../DaysContainer/';

class DashBoard extends React.Component {
    render () {
        return(
            <div className="dashboard">
                <h1>Dashboard</h1>
                <DaysList/>
            </div>
        );
    }
}

export default DashBoard;
