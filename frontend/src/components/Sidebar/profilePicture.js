import React from 'react';

export default class ProfilePicture extends React.Component {
  render() {
    const profilePictureAsBackground = {
      backgroundImage: `url(${this.props.picture}` || '/assets/images/unknown.png' + ')',
    };

    return (
      <div className="profile-picture">
        <div className="profile-img" style={profilePictureAsBackground} />
      </div>
    );
  }
}
