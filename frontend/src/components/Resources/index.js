import React from 'react';
import Config from 'config';
import Topbar from '../Topbar';
import Sidebar from '../Sidebar';

class ResourcesComponent extends React.Component {
    render () {
        return(
            <div className="resources">
                <Topbar />
                <Sidebar/>
            </div>
        )
    }
}

export default ResourcesComponent;
