import React from 'react';
import ReactDOM from 'react-dom';

export default class YearSelector extends React.Component {
	constructor(props) {
		super(props);
		this.state = { value: props.value };
		this.emitChange = this.emitChange.bind(this);
	}

	emitChange(e) {
		this.props.onChange(e);
		this.setState({ value: e.target.value });
	}

	componentWillReceiveProps(nextProps) {
		this.setState({
			value: nextProps.value
		});
	}

	render() {
		return (
			<select className="Display-2Primary" onChange={this.emitChange} name={this.props.target} value={this.state.value}>
				<option value={1}>Freshman</option>
				<option value={2}>Sophomore</option>
				<option value={3}>Junior</option>
				<option value={4}>Senior</option>
				<option value={5}>Post-Senior</option>
			</select>
		);
	}
}