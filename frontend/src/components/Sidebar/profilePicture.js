import React, { PropTypes } from 'react'

class ProfilePicture extends React.Component {
    render () {
        return (
            <div>
                <img className="side-img" src={this.props.pic} />
            </div>
        );
    }
};

export default ProfilePicture;
