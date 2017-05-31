import React from 'react';
import Config from 'config';
import { connect } from 'react-redux';

import Points from './points';
import Username from './username';
import Navigation from './navigation';
import Organization from './organization';
import ProfilePicture from './profilePicture';

class Sidebar extends React.Component {
    render () {
        return (
            <div className="sidebar">
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

const mapStateToProps = (state) => {
    return {

    };
};

export default connect(mapStateToProps, null)(Sidebar);
