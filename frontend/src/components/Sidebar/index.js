import React from 'react';
import Config from 'config';
import Button from 'components/Button';

import Points from './points';
import Username from './username';
import Navigation from './navigation';
import Organization from './organization';
import ProfilePicture from './profilePicture';

export default class Sidebar extends React.Component {
    constructor(props) {
        super(props);
        this.signOut = this.signOut.bind(this);
    }

    signOut() {
        window.localStorage.clear();
        window.location.href = "/login";
    }

    render () {
        return (
            <div className="sidebar">
                <a className="no-style logout-btn" onClick={this.signOut} title="Sign Out"><i className="fa fa-arrow-left"></i></a>
                <div className="sidebar-container">
                    <ProfilePicture isAdmin={this.props.isAdmin} picture={this.props.isAdmin ? Config.organization.logo : this.props.picture}/>
                    <Organization org={Config.organization.shortName} />
                    <Username username={this.props.isAdmin ? "Admin" : this.props.username} />
                    <Navigation isAdmin={this.props.isAdmin} />
                    { !this.props.isAdmin && <Points points={this.props.points} /> }
                </div>
            </div>
        );
    }
}
