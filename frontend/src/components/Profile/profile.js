import React from 'react';

export default class Profile extends React.Component {
    render() {
        if (this.props.error) {
            return <div className="profile-wrapper"><h1>{this.props.error}</h1></div>;
        } else {
            return (
                <div className="profile-wrapper">
                    <h1>Profile</h1>
                </div>
            );
        }
    }
}