import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import './careerProfile.scss';

export default class CareerProfile extends React.Component {
  render() {
    return (
      <div className="career-profile-page">
        <div className="career-profile-header">
          <Link to="/profile" className="back-link">
            <i className="fa fa-arrow-left" />
            <span>Back to Profile</span>
          </Link>
          <h1>Career Profile</h1>
          <p className="subtitle">Showcase your skills and experience to the ACM community</p>
        </div>

        <div className="career-profile-container">
          {/* Left Side: Form */}
          <div className="career-profile-content">
            <div className="coming-soon-card">
              <i className="fa fa-briefcase fa-3x" style={{ color: '#3B59ED', marginBottom: '20px' }} />
              <h2>Career Profile Coming Soon!</h2>
              <p>We're building a comprehensive career profile feature where you'll be able to:</p>
              <ul>
                <li>✨ Add your bio and pronouns</li>
                <li>🔗 Link your LinkedIn, GitHub, and portfolio</li>
                <li>💼 Showcase your skills and interests</li>
                <li>👁️ Control your profile visibility</li>
                <li>📊 Track your profile completeness</li>
              </ul>
              <p className="note">Check back soon or watch for updates!</p>
            </div>
          </div>

          {/* Right Side: Preview/Stats */}
          <div className="career-profile-sidebar">
            <div className="info-card">
              <h3>📈 Profile Tips</h3>
              <ul>
                <li>Complete your bio (150+ chars recommended)</li>
                <li>Add at least 5 skills</li>
                <li>Link your professional profiles</li>
                <li>Make your profile public to increase visibility</li>
              </ul>
            </div>

            <div className="info-card">
              <h3>🎯 Why Build Your Career Profile?</h3>
              <p>Connect with recruiters, showcase your projects, and network with other ACM members!</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

CareerProfile.propTypes = {
  profile: PropTypes.object,
};

CareerProfile.defaultProps = {
  profile: {},
};
