import React from 'react';


export default class ControlPanel extends React.Component {
	render() {
		return (
			<div className="control-panel-wrapper">
				<div className="form-elem">
					<h1>Create a milestone</h1>
					<input type="text" name="name" placeholder="Quarter (e.g. Fall 2017)" />
				</div>
				<div className="form-elem">
					<Button
						className="control-panel-action-button"
						style={ "blue"}
						text="Create" />
				</div>
			</div>
		);
	}
}
