import React from 'react';

import Topbar from 'containers/topbar';
import Sidebar from 'containers/sidebar';
import ControlPanel from './controlPanel';

export default class ControlPanelComponent extends React.Component {
	render() {
		return (
<<<<<<< HEAD
			<div className="control-panel">
				<Topbar />
				<Sidebar/>
        <ControlPanel />
=======
			<div className="controlpanel">
				<Topbar />
				<Sidebar/>
				<ControlPanel/>
>>>>>>> master
			</div>
		);
	}
}
