import React from 'react';

import Topbar from 'containers/topbar';
import Sidebar from 'containers/sidebar';
import ControlPanel from './controlPanel';

export default class ControlPanelComponent extends React.Component {
	render() {
		return (
			<div className="controlpanel">
				<Topbar />
				<Sidebar/>
				<ControlPanel
				   logout={this.props.logout}/>
			</div>
		);
	}
}
