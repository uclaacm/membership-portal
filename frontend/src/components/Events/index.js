import React from 'react'
import Topbar from 'components/Topbar'
import Sidebar from 'components/Sidebar'
import UserEvents from './userEvents'
import AdminEvents from './adminEvents'

export default class EventsComponent extends React.Component {
    render() {
        const isAdmin = false;
        return (
            <div className="dashboard">
                <Topbar />
                <Sidebar/>
                {
                    isAdmin ? <AdminEvents events={this.props.events} error={this.props.error} admin={true} />
                            : <UserEvents events={this.props.events} error={this.props.error} admin={false} />
                }
            </div>
        );
    }
}