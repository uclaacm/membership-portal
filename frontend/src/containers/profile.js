import React from 'react';
import {connect} from 'react-redux';
import {replace} from 'react-router-redux';

import {Action} from 'reducers';
import ProfileComponent from 'components/Profile';


class Profile extends React.Component {
    constructor(props) {
        super(props);
    }

    saveChanges(newprofile) {
        this.props.updateUser(newprofile);
    }

    componentWillMount() {
        if (this.props.authenticated && !this.props.fetchsuccess) {
            this.props.fetchUser();
        }

        if (this.props.isAdmin) {
            this.props.redirectHome();
        }
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.updated){
            setTimeout(() => {
                this.props.updateDone();
            }, 1000);
        }

        if (nextProps.isAdmin) {
            nextProps.redirectHome();
        }
    }

    render() {
        return <ProfileComponent
                    profile={this.props.profile}
                    updated={this.props.updated}
                    updateSuccess={this.props.updateSuccess}
                    updateError={this.props.updateError}
                    saveChanges={this.saveChanges.bind(this)} />;
    }
}

const mapStateToProps = (state)=>{
    let profile = { name: "", major: "", year: 0, points: 0};

    if (state.User.get("fetchsuccess")) {
        const User = state.User.get("profile");
        profile.name = `${User.firstName} ${User.lastName}`;
        profile.major = User.major;
        profile.year = User.year;
        profile.points = User.points;
    }

    return {
        profile,
        updated: state.User.get('updated'),
        updateSuccess: state.User.get('updateSuccess'),
        updateError: state.User.get('error'),
        authenticated: state.Auth.get("authenticated"),
        isAdmin: state.Auth.get('isAdmin'),
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
        redirectHome: ()=>{
            dispatch(replace('/'));
        },
        updateDone: ()=>{
            dispatch(Action.UserUpdateDone());
        },
    };
};


export default connect(mapStateToProps, mapDispatchToProps)(Profile);