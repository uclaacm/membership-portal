import React from 'react'
import Modal from './modal'
import Button from '../Button'


export default class ModalComponent extends React.Component {
	constructor(props) {
		super(props);
		this.setState({
			display: false
		});
	}

	closeModal() {
		this.setState({
			display: !this.state.display
		});
	}

	render() {
		return (
			<div className="modal-container">
				<h1>{this.props.title}</h1>
				<p>{this.props.text}</p>
				<Button style="red" text="close" onClick={this.closeModal}></Button>
			</div>
		)
	}
}