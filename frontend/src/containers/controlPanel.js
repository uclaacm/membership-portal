import React from 'react';
import {connect} from 'react-redux';
import {replace} from 'react-router-redux';

import {Action} from 'reducers';
import ControlPanelComponent from 'components/ControlPanel';

import moment from 'moment';

class ControlPanel extends React.Component {
	constructor(props) {
		super(props);
	}

	componentWillMount() {
		if (!this.props.isAdmin) {
			return this.props.redirectHome();
		}
		
	}

	componentWillReceiveProps(nextProps) {
		if (!nextProps.isAdmin) {
			return nextProps.redirectHome();
		}
		
	}

	render() {
		return <ControlPanelComponent/>;
	}
}

const mapStateToProps = (state)=>{


	return {
		authenticated: state.Auth.get("authenticated"),
		isAdmin: state.Auth.get('isAdmin'),
	};
};

const mapDispatchToProps = (dispatch)=>{
	return {
		
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(ControlPanel);
