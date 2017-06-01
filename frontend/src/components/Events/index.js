import React from 'react';
import Topbar from 'components/Topbar';

import Sidebar from 'containers/sidebar';
import UserEvents from './userEvents';

export default class EventsComponent extends React.Component {
    render() {
        return (
            <div className="dashboard">
                <Topbar />
                <Sidebar/>
                <UserEvents  events={this.props.events} error={this.props.error} />
            </div>
        );
    }
}
