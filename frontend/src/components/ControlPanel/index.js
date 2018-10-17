import React from 'react';

import Topbar from 'containers/topbar';
import Sidebar from 'containers/sidebar';
import ControlPanel from './controlPanel';


var names = ["Howard", "Mihir"];
var points = [60, 40];
export default class ControlPanelComponent extends React.Component {
	render() {
		return (
			<div className="controlpanel">
				<Topbar />
				<Sidebar/>
				<ControlPanel
				   logout={this.props.logout}
				   top={names[0]}
				   topPoints={points[0]}/>
			</div>
		);
	}
}
