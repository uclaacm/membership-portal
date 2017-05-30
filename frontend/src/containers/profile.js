import React from 'react';
import {connect} from 'react-redux';
import {Action} from 'reducers';
import ProfileComponent from 'components/Profile';

import { replace } from 'react-router-redux';


class Profile extends React.Component {

    saveChanges(newprofile) {
        this.props.saveProfileChanges(newprofile);
    }

    componentWillMount() {
        if (this.props.authenticated) {
            this.props.fetchUser();
        }
    }

    render() {

        return this.props.fetchsuccess ? <ProfileComponent profile={this.props.profile} /> : null;
    }
}

const mapStateToProps = (state)=>{

    const A = state.Auth;
    const u = state.User;

    let profile = {};
    profile.name='';
    profile.major='';
    profile.year=0;
    profile.points=0;

    console.log(state);

    if (u.get("fetchsuccess")) {
        const U = u.get("profile");
        profile.name = `${U.firstName} ${U.lastName}`;
        profile.major = U.major;
        profile.year = U.year;
        profile.points = U.points;

        return {
            profile,
            fetchsuccess: true,
            authenticated: true,
        }
    } else {
        return {
            fetchsuccess: false,
            authenticated: state.Auth.get("authenticated")
        }
    }

};

const mapDispatchToProps = (dispatch)=>{
    return {
        fetchUser: () => {
            dispatch(Action.FetchUser());
        },

        saveProfileChanges: (newprofile) => {
            
        }
    };
};


Profile = connect(mapStateToProps, mapDispatchToProps)(Profile);
export default Profile
