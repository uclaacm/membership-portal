import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import Button from 'components/Button/index';

class SignIn extends React.Component {
  render() {
    const { loading } = this.props;
    return (
      <div className="sign-in">
        <Button className="input-button" type="submit" color="green" text="Sign In" loading={loading} />
        <NavLink to="/resetpassword" className="input-text forgot-password Body-2White">I forgot my password</NavLink>
      </div>
    );
  }
}

SignIn.propTypes = {
  loading: PropTypes.bool.isRequired,
};

export default SignIn;
