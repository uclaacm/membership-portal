import React from 'react'
import Modal from './modal'
import Button from '../Button'


export default class ModalComponent extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			display: true
		}
	}

	closeModal() {
		this.setState({
			display: !this.state.display
		});
		console.log("display: " + state.display);
	}

	render() {
		//const display = this.state.display;
		if (this.state.display) {
			return (
				<div className="modal-container">{/*{this.state.display ? "modal-container" : ""*/}
					<h1>{this.props.title}</h1>
					<p>{this.props.text}</p>
					<Button style="red" text="close" onClick={this.closeModal.bind(this)}/>
				</div> 	
			)
		}
		else {
			return (<div></div>)
		}
	}
}