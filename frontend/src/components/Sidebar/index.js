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
                <Button className="logout-btn" style="gray collapsed" icon="fa fa-sign-out" onClick={this.signOut} />
                <div className="sidebar-container">
                    <ProfilePicture pic={this.props.pic}/>
                    <Organization org={Config.organization.shortName} />
                    <Username username={this.props.username} />
                    <Navigation/>
                    <Points points={this.props.points} />
                </div>
            </div>
        );
    }
}
