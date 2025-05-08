import React from 'react';
import { connect } from 'react-redux';
import { replace } from 'react-router-redux';
import RegisterComponent from 'components/Register';
import { Action } from 'reducers';

class Register extends React.Component {
  constructor(props) {
    super(props);
    this.createUser = this.createUser.bind(this);
  }

  createUser(profile) {
    this.props.registerUser(profile);
  }

  componentWillMount() {
    if (this.props.tokenIsAuthenticated && this.props.tokenIsRegistered) {
      this.props.redirectHome();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.registered) {
      setTimeout(() => {
        this.props.registerDone();
      }, 1000);
    }
  }

  render() {
    return (
      <RegisterComponent
        createUser={this.createUser}
        created={this.props.registered}
        createSuccess={this.props.registerSuccess}
        createError={this.props.error}
      />
    );
  }
}

const mapStateToProps = state => ({
  user: state.Registration.get('user'),
  error: state.Registration.get('error'),
  registered: state.Registration.get('registered'),
  registerSuccess: state.Registration.get('registerSuccess'),
  tokenIsAuthenticated: state.Auth.get('authenticated'),
  tokenIsRegistered: state.Auth.get('isRegistered'),
});

const mapDispatchToProps = dispatch => ({
  registerUser: (info) => {
    dispatch(Action.RegisterUser(info));
  },
  registerDone: () => {
    dispatch(Action.registerDone());
  },
  redirectHome: () => {
    dispatch(replace('/'));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(Register);
