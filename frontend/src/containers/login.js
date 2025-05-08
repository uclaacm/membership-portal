import React from 'react';
import { connect } from 'react-redux';
import { replace } from 'react-router-redux';

import { Action } from 'reducers';
import LoginComponent from 'components/Login';

class Login extends React.Component {
  handleLogin(token) {
    this.props.login(token);
  }

  componentWillMount() {
    if (this.props.authenticated && this.props.isRegistered) {
      this.props.redirectHome();
    } else if (this.props.authenticated && !this.props.isRegistered) {
      this.props.redirectRegister();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.authenticated && nextProps.isRegistered) {
      this.props.redirectHome();
    } else if (nextProps.authenticated && !nextProps.isRegistered) {
      this.props.redirectRegister();
    }
  }

  render() {
    return <LoginComponent onsubmit={this.handleLogin.bind(this)} />;
  }
}

const mapStateToProps = state => ({
  isAdmin: state.Auth.get('isAdmin'),
  isRegistered: state.Auth.get('isRegistered'),
  timestamp: state.Auth.get('timestamp'),
  authenticated: state.Auth.get('authenticated'),
});

const mapDispatchToProps = dispatch => ({
  login: (token) => {
    dispatch(Action.LoginUser(token));
  },
  redirectHome: () => {
    dispatch(replace('/'));
  },
  redirectRegister: () => {
    dispatch(replace('/register'));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(Login);
