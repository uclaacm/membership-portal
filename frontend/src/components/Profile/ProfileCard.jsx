import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import Utils from 'utils';
import Config from 'config';
import './profileCard.scss';

export default class ProfileCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      password: '',
      email: '',
      message: '',
    };
    this.handleRegisterClick = this.handleRegisterClick.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.closeModal = this.closeModal.bind(this);
  }

  handleRegisterClick(e) {
    e.preventDefault();
    this.setState({ showModal: true, message: '' });
  }

  closeModal() {
    this.setState({
      showModal: false, password: '', email: '', message: '',
    });
  }

  async handleSubmit() {
    try {
      const response = await fetch(Config.API_URL + Config.routes.admin.promote, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: this.state.email,
          password: this.state.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        this.setState({ message: `✅ ${data.message}`, password: '' });
      } else {
        this.setState({ message: `❌ ${data.error}`, password: '' });
      }
    } catch (error) {
      console.error('Error in POST request:', error);
      this.setState({ message: '❌ An unknown error occurred.', password: '' });
    }
  }

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
          <Link to="/profile/career" className="card-link">
            <i className="fa fa-briefcase" />
            <span>Career Profile</span>
          </Link>
          {isAdmin && (
            <a href="#" className="card-link" onClick={this.handleRegisterClick}>
              <i className="fa fa-user-plus" />
              <span>Register as an Officer</span>
            </a>
          )}
        </div>

        {this.state.showModal && (
          <div className="modal-overlay" onClick={this.closeModal}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <h2>Register Officer Account</h2>
              <input
                type="text"
                placeholder="User Email"
                value={this.state.email}
                onChange={e => this.setState({ email: e.target.value })}
              />
              <input
                type="password"
                placeholder="Admin Password"
                value={this.state.password}
                onChange={e => this.setState({ password: e.target.value })}
              />
              <button onClick={this.handleSubmit} className="submit-button">
                Submit
              </button>
              <button onClick={this.closeModal} className="cancel-button">
                Cancel
              </button>
              {this.state.message && <p className="message">{this.state.message}</p>}
            </div>
          </div>
        )}
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
