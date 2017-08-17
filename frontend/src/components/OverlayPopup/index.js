import React from 'react'
import Button from 'components/Button'

export default class OverlayPopup extends React.Component {
	constructor(props) {
		super(props);
		this.handleCancel = this.handleCancel.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleCancel(e) {
		if (this.props.onCancel)
			this.props.onCancel(e);
	}

	handleSubmit(e) {
		if (this.props.onSubmit)
			this.props.onSubmit(e);
	}

	render () {
		if (!this.props.showing)
			return null;
		
		return (
			<div className="overlay" onClick={this.handleCancel}>
				<div className={"overlay-popup " + this.props.className} onClick={ e => e.stopPropagation() }>
					{this.props.title && <h2>{this.props.title}</h2> }
					{this.props.children}
					<div className="popup-buttons">
						{this.props.submitText && <Button className="popup-button popup-submit-button" style="green" text={this.props.submitText} onClick={this.handleSubmit} /> }
						{this.props.cancelText && <Button className="popup-button popup-cancel-button" style="red" text={this.props.cancelText} onClick={this.handleCancel} /> }
					</div>
				</div>
			</div>
		);
	}
}
