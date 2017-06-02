import React, { PropTypes } from 'react';

import {Action} from 'reducers';
import { connect } from 'react-redux';

import Topbar from 'components/Topbar';

class TopbarContainer extends React.Component {
    componentWillMount() {
        if (this.props.authenticated) {
            this.props.fetchUser();
        }
    }

    render () {
        return this.props.fetchsuccess ? <Topbar isAdmin={this.props.isAdmin} /> : null;
    }
}

const mapStateToProps = (state) => {
    const u = state.User;
    if (u.get("fetchsuccess")) {
        return {
            fetchsuccess: true,
            authenticated: true,
            isAdmin: state.Auth.get('isAdmin')
        }
    } else {
        return {
            fetchsuccess: false,
            authenticated: state.Auth.get("authenticated"),
            isAdmin: state.Auth.get('isAdmin')
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

export default connect(mapStateToProps, mapDispatchToProps)(TopbarContainer);
