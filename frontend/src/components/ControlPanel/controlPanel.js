import React from 'react';

import Topbar from 'containers/topbar';
import Sidebar from 'containers/sidebar';
import ControlPanel from './controlPanel';
import Button from 'components/Button';

export default class ControlPanelComponent extends React.Component {
	render() {
		return (
			<div className="control-panel-wrapper">
				<h1>Control Panel</h1>
				<div className="form-elem">
						<Button
							className="signout-action-button"
							style="blue"
							text="Sign Out"
							onClick={this.props.logout}/>
						<Button
							className="deleteevents-action-button"
							style="red"
							text="Delete Events"/>
				</div>
			</div>
		);
	}
}
