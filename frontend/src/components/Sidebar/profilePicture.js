import React, { PropTypes } from 'react'

class ProfilePicture extends React.Component {
    render () {
        return (
            <div className="profile-picture">
                <img className="profile-img" src={this.props.pic} />
            </div>
        );
    }
};

export default ProfilePicture;
