import React from 'react';
import Config from 'config';
import Topbar from 'components/Topbar';
import Sidebar from 'components/Sidebar';
import Resources from './resources';

export default class ResourcesComponent extends React.Component {
    render () {
        return(
            <div className="resources">
                <Topbar />
                <Sidebar/>
                <Resources resources={ this.props.resources } />
            </div>
        );
    }
}