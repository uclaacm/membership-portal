import React from 'react'

export default class ModalComponent extends React.Component {
	constructor(props, width, height) {
		super(props);
		this.height = height;
		this.width = width;
		this.clicked = false;
	}

	render() {
		return (
			<div>
				<h1>{this.props.title}</h1>
				<div className="modal-container">
					<h1>hello world</h1>
				</div>
			</div>
		)
	}
}
