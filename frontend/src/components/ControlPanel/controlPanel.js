import React from 'react';

export default class ControlPanel extends React.Component {
	render() {
		return (
			<div className="control-panel-wrapper">
				<div className="form-elem">
					<p className="SubheaderSecondary">Committee</p>
					<select className="Display-2Primary">
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
