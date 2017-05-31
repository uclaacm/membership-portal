import React from 'react';
import {connect} from 'react-redux';
import RegisterComponent from 'components/Register'


class Register extends React.Component {
	constructor(props) {
		super(props);

		this.createUser = this.createUser.bind(this);
	}

	createUser(profile) {

	}

	render(){
		return <RegisterComponent createUser={this.createUser} created={this.props.created} createSuccess={this.props.createSuccess} createError={this.props.createError} />
	}
}

const mapStateToProps = (state) => {
	
};

const mapDispatchToProps = (dispatch) => {
	
};


export default connect(mapStateToProps, mapDispatchToProps)(Register);