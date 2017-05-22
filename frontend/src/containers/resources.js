import React from 'react';
import {connect} from 'react-redux';
import {Action} from 'reducers';
import ResourcesComponent from 'components/Resources';

import { replace } from 'react-router-redux';


class Resources extends React.Component {

    render() {
        return(
            <div>
                <ResourcesComponent/>
            </div>
        )
    }
}

const mapStateToProps = (state)=>{
    const A = state.Auth;
    return {

    };
};

const mapDispatchToProps = (dispatch)=>{
  return {

  };
};


Resources = connect(mapStateToProps, mapDispatchToProps)(Resources);
export default Resources
