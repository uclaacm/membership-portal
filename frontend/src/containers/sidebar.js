import React from 'react';
import {connect} from 'react-redux';

import {Action} from 'reducers';
import Sidebar from 'components/Sidebar';

class SidebarContainer extends React.Component {
    componentWillMount() {
        if (this.props.authenticated) {
            this.props.fetchUser();
        }
    }

    render () {
        return this.props.fetchsuccess ? 
                    <Sidebar
                        isAdmin={this.props.isAdmin}
                        picture={this.props.picture}
                        username={this.props.username}
                        points={this.props.points} /> : null;
    }
}

const mapStateToProps = (state) => {
    if (state.User.get("fetchsuccess")) {
        const User = state.User;
        return {
            fetchsuccess: true,
            authenticated: true,
            picture: User.get("profile").picture,
            username: `${User.get("profile").firstName} ${User.get("profile").lastName}`,
            points: User.get("profile").points,
            isAdmin: state.Auth.get('isAdmin')
        };
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