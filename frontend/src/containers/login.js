import React from 'react';
import {connect} from 'react-redux';
import LoginComponent from 'components/Login'


class Login extends React.Component {
  render(){
    return <div>
      {/*Login<br/>
      Path: {this.props.urlPath}*/}
      <LoginComponent/>

    </div>;
  }
}

const mapStateToProps = (state)=>{
  return {
    urlPath: state.router.location.pathname,
  };
};

const mapDispatchToProps = (dispatch)=>{
  return {
  };
};


Login = connect(mapStateToProps, mapDispatchToProps)(Login);
export default Login
