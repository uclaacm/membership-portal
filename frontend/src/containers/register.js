import React from 'react';
import {connect} from 'react-redux';
import RegisterComponent from 'components/Register'
import {Action} from 'reducers';


class Register extends React.Component {
	constructor(props){
		super(props);
		this.createUser = this.createUser.bind(this);
	}

	createUser(profile) {
		this.props.registerUser(profile);
	}

	render(){
		return <RegisterComponent createUser={this.createUser} created={this.props.registered} createSuccess={this.props.registerSuccess} createError={this.props.error} />
	}
}

const mapStateToProps = (state)=>{
	return {
		registered: state.Registration.get('registered'),
		registerSuccess: state.Registration.get('registerSuccess'),
		error: state.Registration.get('error'),
		newuser: state.Registration.get('newuser'),
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		registerUser: (newuser)=>{
			dispatch(Action.RegisterUser(newuser));
		},
	};
};


export default connect(mapStateToProps, mapDispatchToProps)(Register);
