import React from 'react'
import Topbar from '../Topbar'
import Sidebar from '../Sidebar'
import EventsDashboard from './eventsDashboard'

export default class Dashboard extends React.Component {
    render() {
        return (
            <div className="dashboard">
                <Topbar />
                <Sidebar/>
                <EventsDashboard events={this.props.events} error={this.props.error}/>
            </div>
        );
    }
}