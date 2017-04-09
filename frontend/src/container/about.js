import React from 'react';
import {connect} from 'react-redux';


class About extends React.Component {
  render(){
    return <div>
      About<br/>
      Path: {this.props.urlPath}
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


About = connect(mapStateToProps, mapDispatchToProps)(About);
export default About
