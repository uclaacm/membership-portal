import React from 'react';
import PropTypes from 'prop-types';

class LeaderboardPicture extends React.Component {
  render() {
    const {
      picture, firstName, lastName, major, year, onChange,
    } = this.props;

    const pict = picture || '/assets/images/unknown.png';
    const profilePictureAsBackground = {
      backgroundImage: `url(${pict})`,
    };

    return (
      <div
        className="profile-pic"
        style={profilePictureAsBackground}
        onClick={onChange.bind(this, firstName, lastName, picture, major, year)}
      />
    );
  }
}

LeaderboardPicture.propTypes = {
  picture: PropTypes.string.isRequired,
  firstName: PropTypes.string.isRequired,
  lastName: PropTypes.string.isRequired,
  major: PropTypes.string.isRequired,
  year: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default LeaderboardPicture;
