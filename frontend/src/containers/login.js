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
    if (this.props.authenticated) {
      this.props.redirectHome();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.authenticated) {
      this.props.redirectHome();
    }
  }

  render() {
    return <LoginComponent onsubmit={this.handleLogin.bind(this)} />;
  }
}

const mapStateToProps = state => ({
  isAdmin: state.Auth.get('isAdmin'),
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
});

export default connect(mapStateToProps, mapDispatchToProps)(Login);
