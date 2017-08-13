import React from 'react'
import Loader from 'components/Loader';

export default class Button extends React.Component {
	constructor(props) {
		super(props);
		this.buttonAction = this.buttonAction.bind(this);
	}

	buttonAction(e) {
		if (!this.loading && this.props.onClick) {
			this.props.onClick(e);
		}
	}

	render() {
		const buttonClass = `button-component ${this.props.className}`;
		const buttonIcon = this.props.icon ? <i className={`fa ${this.props.icon} button-icon`} aria-hidden="true"></i> : null;
		return (
			<div className={ buttonClass } onClick={ this.buttonAction }>
				<button className={ this.props.style }>
					{ !this.props.loading && buttonIcon }   
					{ !this.props.loading && <span>{this.props.text}</span> }  
					{  this.props.loading && <Loader /> }  
				</button>
			</div>
		);
	}
}