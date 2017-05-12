import React from 'react';
import {connect} from 'react-redux';
import {Action} from 'reducers';
import LoginComponent from 'components/Login'


class Login extends React.Component {

    handleLogin(email, password) {
        this.props.login(email, password);
    }

    render() {
        return(
            <div>
                <LoginComponent onsubmit={this.handleLogin.bind(this)} error={this.props.error}/>
            </div>
        )
    }
}

const mapStateToProps = (state)=>{
    const A = state.Auth;
    return {
        error: A.get("error"),
        message: A.get("message"),
        content: A.get("content"),
        authenticated: A.get("authenticated")
    };
};

const mapDispatchToProps = (dispatch)=>{
  return {
      login: (email, password) => {
          dispatch(Action.LoginUser(email, password));
      }
  };
};


Login = connect(mapStateToProps, mapDispatchToProps)(Login);
export default Login
