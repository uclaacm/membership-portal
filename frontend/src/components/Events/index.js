import React from 'react';
import Topbar from 'components/Topbar';

import Sidebar from 'containers/sidebar';
import UserEvents from './userEvents';
import AdminEvents from './adminEvents';

export default class EventsComponent extends React.Component {
    render() {
        console.log(this.props.events);
        return (
            <div className="dashboard">
                <Topbar />
                <Sidebar/>
                <UserEvents events={this.props.events} error={this.props.error} />
                {/*<AdminEvents  events={this.props.events} error={this.props.error} />*/}
            </div>
        );
    }
}
