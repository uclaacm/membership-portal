import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import Utils from 'utils';
import './profileCard.scss';

export default class ProfileCard extends React.Component {
  render() {
    const { profile, isAdmin, activity } = this.props;
    const { currLevel, nextLevel } = Utils.getLevel(profile.points);

    const yearMap = ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Post-Senior'];
    const yearLabel = yearMap[profile.year - 1] || `Year ${profile.year}`;

    // Calculate events attended from activity
    const eventsAttended = activity ? activity.filter(a => a.type === 'ATTEND_EVENT').length : 0;

    const pointsToNext = nextLevel ? nextLevel.startsAt - profile.points : 0;
    const progressPercent = nextLevel
      ? ((profile.points - currLevel.startsAt) / (nextLevel.startsAt - currLevel.startsAt)) * 100
      : 100;

    return (
      <div className="profile-card">
        <div className="profile-card-header">
          <img
            src={profile.picture || '/assets/images/unknown.png'}
            alt={`${profile.firstName} ${profile.lastName}`}
            className="profile-card-avatar"
          />
          <div className="profile-card-info">
            <h2 className="profile-card-name">
              {profile.firstName}
              {' '}
              {profile.lastName}
            </h2>
            <p className="profile-card-details">
              {yearLabel}
              {' '}
              •
              {' '}
              {profile.major}
            </p>
          </div>
        </div>

        <div className="profile-card-stats">
          <div className="stat-item">
            <span className="stat-label">Points</span>
            <span className="stat-value">{profile.points}</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-label">Events</span>
            <span className="stat-value">{eventsAttended}</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-label">Rank</span>
            <span className="stat-value">
              #
              {profile.rank || '–'}
            </span>
          </div>
        </div>

        <div className="profile-card-rank">
          <div className="rank-header">
            <span className="rank-current">{currLevel.rank}</span>
            {nextLevel && (
              <span className="rank-next">
                {pointsToNext}
                {' '}
                pts to
                {' '}
                {nextLevel.rank}
              </span>
            )}
            {!nextLevel && (
              <span className="rank-next">Max Rank! 🎉</span>
            )}
          </div>
          {nextLevel && (
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
            </div>
          )}
        </div>

        <div className="profile-card-divider" />

        <div className="profile-card-committee">
          <div className="committee-label">Committee</div>
          <div className="committee-value">{profile.committee || 'Not assigned'}</div>
        </div>

        <div className="profile-card-divider" />

        <div className="profile-card-actions">
          <Link to="/profile/career/edit" className="card-link">
            <i className="fa fa-briefcase" />
            <span>Career Profile</span>
          </Link>
        </div>
      </div>
    );
  }
}

ProfileCard.propTypes = {
  profile: PropTypes.object.isRequired,
  isAdmin: PropTypes.bool,
  activity: PropTypes.array,
};

ProfileCard.defaultProps = {
  isAdmin: false,
  activity: [],
};
