import React from 'react';
import {connect} from 'react-redux';
import {Action} from 'reducers';
import ProfileComponent from 'components/Profile';

import { replace } from 'react-router-redux';


class Profile extends React.Component {

    render() {
        return(
            <div>
                <ProfileComponent profile={this.props.profile} />
            </div>
        )
    }
}

const mapStateToProps = (state)=>{
    const A = state.Auth;
    const U = state.User;
    console.log(`profile: ${U}`);
    return {
        profile: U.get("profile"),
    };
};

const mapDispatchToProps = (dispatch)=>{
  return {

  };
};


Profile = connect(mapStateToProps, mapDispatchToProps)(Profile);
export default Profile;
