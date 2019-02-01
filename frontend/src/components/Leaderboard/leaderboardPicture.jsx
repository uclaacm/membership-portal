import React from 'react';
import PropTypes from 'prop-types';

class LeaderboardPicture extends React.Component {
  render() {
    const { picture } = this.props;

    const pict = picture || '/assets/images/unknown.png';
    const profilePictureAsBackground = {
      backgroundImage: `url(${pict})`,
    };

    return (
      <div className="profile-pic" style={profilePictureAsBackground} />
    );
  }
}

LeaderboardPicture.propTypes = {
  picture: PropTypes.string.isRequired,
};

export default LeaderboardPicture;
