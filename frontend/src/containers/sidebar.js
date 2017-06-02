import React, { PropTypes } from 'react';

import {Action} from 'reducers';
import { connect } from 'react-redux';

import Sidebar from 'components/Sidebar';

class SidebarContainer extends React.Component {
    componentWillMount() {
        if (this.props.authenticated) {
            this.props.fetchUser();
        }
    }

    render () {
        return this.props.fetchsuccess ? <Sidebar isAdmin={this.props.isAdmin} pic={this.props.pic} username={this.props.username} points={this.props.points} /> :
            null;
    }
}

const mapStateToProps = (state) => {
    const u = state.User;
    if (u.get("fetchsuccess")) {

        return {
            fetchsuccess: true,
            authenticated: true,
            pic: u.get("profile").picture,
            username: `${u.get("profile").firstName} ${u.get("profile").lastName}`,
            points: u.get("profile").points,
            isAdmin: state.Auth.get('isAdmin')
        }

    } else {
        return {
            fetchsuccess: false,
            authenticated: state.Auth.get("authenticated")
        }
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        fetchUser: () => {
            dispatch(Action.FetchUser());
        }
    };

}

export default connect(mapStateToProps, mapDispatchToProps)(SidebarContainer);
