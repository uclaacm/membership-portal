import React from 'react';
import Config from 'config';

import Button from 'components/Button';

export default class ResetPassCard extends React.Component {
	constructor(props) {
		super(props)
		this.handleChange = this.handleChange.bind(this);
	}

	handleChange(e) {
		if (this.props.onChange)
			this.props.onChange(e.target.name, e.target.value);
	}

	render() {
		return (
			<div className="card details-card">
				<img src={Config.organization.logo} />
				<p className="question" style={{marginTop:'20px'}}>What's your name?</p>
				<div className="inner">
					<form onSubmit={this.props.onSubmit} autoComplete="off">
						<div>
							<p className="text">First Name</p>
							<input type="text" className="input-large" name="firstName" onChange={this.handleChange}></input>
						</div>
						<div>
							<p className="text">Last Name</p>
							<input type="text" className="input-large" name="lastName" onChange={this.handleChange}></input>
						</div>
						<Button className="btn" style={this.props.profileValid() ? "green" : "disabled"} text="Next" onClick={this.props.onSubmit}/>
					</form>
					<p className="info-compact">Note: You'll be assigned an auto-generated profile picture.</p>
				</div>
			</div>
		);
	}
}