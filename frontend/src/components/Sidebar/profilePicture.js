import React from 'react'

export default class ProfilePicture extends React.Component {
    render () {
        return (
            <div className="profile-picture">
                <img className={"profile-img" + (this.props.isAdmin ? " admin-profile-img" : "")} src={this.props.pic || "/assets/images/unknown.png"} />
            </div>
        );
    }
};