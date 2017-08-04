import React from 'react';
import Config from 'config';
import Topbar from 'containers/topbar';
import Sidebar from 'containers/sidebar';
import Resources from './resources';

export default class ResourcesComponent extends React.Component {
    render () {
        return(
            <div className="resources">
                <Topbar />
                <Sidebar/>
                <Resources />
            </div>
        );
    }
}
