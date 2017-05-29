import React from 'react'
import Topbar from 'components/Topbar'
import Sidebar from 'components/Sidebar'
import Events from './events'

export default class EventsComponent extends React.Component {
    render() {
        return (
            <div className="dashboard">
                <Topbar />
                <Sidebar/>
                <Events events={this.props.events} error={this.props.error}/>
            </div>
        );
    }
}