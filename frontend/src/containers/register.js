import React from 'react';
import {connect} from 'react-redux';
import RegisterComponent from 'components/Register'


class Register extends React.Component {
  render(){
    return <div>
      {/*Login<br/>
      Path: {this.props.urlPath}*/}
      <RegisterComponent/>

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


Register = connect(mapStateToProps, mapDispatchToProps)(Register);
export default Register
