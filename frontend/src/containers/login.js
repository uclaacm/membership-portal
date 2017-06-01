import React from 'react';
import {connect} from 'react-redux';
import {Action} from 'reducers';
import LoginComponent from 'components/Login'

import { replace } from 'react-router-redux';


class Login extends React.Component {
  handleLogin(email, password) {
    this.props.login(email, password);
  }

  componentWillMount() {
    if(this.props.authenticated) {
      if(this.props.isAdmin){
        this.props.redirectAdmin();
      } else {
        this.props.redirectHome();
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.authenticated) {
      if(nextProps.isAdmin){
        this.props.redirectAdmin();
      } else {
        this.props.redirectHome();
      }
    }
  }

  render() {
    return <div>
      <LoginComponent onsubmit={this.handleLogin.bind(this)} error={this.props.error}/>
    </div>;
  }
}

const mapStateToProps = (state)=>{
  const A = state.Auth;
  return {
    error: A.get('error'),
    message: A.get('message'),
    content: A.get('content'),
    authenticated: A.get('authenticated'),
    isAdmin: A.get('isAdmin'),
  };
};

const mapDispatchToProps = (dispatch)=>{
  return {
    login: (email, password) => {
      dispatch(Action.LoginUser(email, password));
    },
    redirectHome: ()=>{
      dispatch(replace('/'));
    },
    redirectAdmin: ()=>{
      dispatch(replace('/admin'));
    },
  };
};


Login = connect(mapStateToProps, mapDispatchToProps)(Login);
export default Login
