import React from 'react';
import {connect} from 'react-redux';
import {Action} from 'reducers';
import ProfileComponent from 'components/Profile';

import { replace } from 'react-router-redux';


class Profile extends React.Component {

    saveChanges(newprofile) {
        this.props.updateUser(newprofile);
    }

    componentWillMount() {
        if (this.props.authenticated && !this.props.fetchsuccess) {
            this.props.fetchUser();
        }
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.updated){
            setTimeout(() => {
                this.props.updateDone();
            }, 1000);
        }
    }

    render() {
        return <ProfileComponent profile={this.props.profile} updated={this.props.updated} updateSuccess={this.props.updateSuccess} updateError={this.props.updateError} saveChanges={this.saveChanges.bind(this)}/>;
    }
}

const mapStateToProps = (state)=>{
    const A = state.Auth;
    const u = state.User;

    let profile = {};
    profile.name = "";
    profile.major = "";
    profile.year = 0;
    profile.points = 0;

    if (u.get("fetchsuccess")) {
        const U = u.get("profile");
        profile.name = `${U.firstName} ${U.lastName}`;
        profile.major = U.major;
        profile.year = U.year;
        profile.points = U.points;
    }

    return {
        profile,
        authenticated: state.Auth.get("authenticated"),
        updated: u.get('updated'),
        updateSuccess: u.get('updateSuccess'),
        updateError: u.get('error'),
    };
};

const mapDispatchToProps = (dispatch)=>{
    return {
        fetchUser: () => {
            dispatch(Action.FetchUser());
        },

        updateUser: (newprofile) => {
            dispatch(Action.UpdateUser(newprofile))
        },

        updateDone: ()=>{
            dispatch(Action.UserUpdateDone());
        },
    };
};


Profile = connect(mapStateToProps, mapDispatchToProps)(Profile);
export default Profile
