import React from 'react';

export default class ControlPanel extends React.Component {
	render() {
		return (
			<div className="control-panel-wrapper">
				<div className="form-elem">
					<h1 className="DisplayPrimary">Event Analytics</h1>
					<select className="Headline-2Secondary">
						<option>General</option>
						<option>AI</option>
						<option>Board</option>
						<option>Hack</option>
						<option>ICPC</option>
						<option>NetSec</option>
						<option>Studio</option>
						<option>W</option>
					</select>
				</div>
			</div>
		);
	}
}
