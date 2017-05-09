import React, { PropTypes } from 'react'
import Sidebar from 'components/Sidebar'
import EventsDashboard from './eventsDashboard'


class Dashboard extends React.Component {
    render () {
        return(
            <div className="dashboard">
                <Sidebar/>
                <EventsDashboard/>
            </div>
        );
    }
}

export default Dashboard;
