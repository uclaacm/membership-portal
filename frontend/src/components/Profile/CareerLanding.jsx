import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import './careerLanding.scss';

export default class CareerLanding extends React.Component {
  calculateCompleteness() {
    const profile = this.props.profile;
    let completed = 0;
    const total = 6;

    if (profile.bio && profile.bio.length >= 50) completed++;
    if (profile.skills && profile.skills.length >= 3) completed++;
    if (profile.careerInterests && profile.careerInterests.length >= 2) completed++;
    if (profile.linkedinUrl || profile.githubUrl) completed++;
    if (profile.portfolioUrl || profile.personalWebsite) completed++;
    if (profile.pronouns) completed++;

    return Math.round((completed / total) * 100);
  }

  render() {
    const { profile } = this.props;
    const completeness = this.calculateCompleteness();
    const isPublic = profile.isProfilePublic !== undefined ? profile.isProfilePublic : true;

    return (
      <div className="career-landing">
        <div className="career-landing-header">
          <h1>Career Hub</h1>
          <p>Manage your professional profile, explore opportunities, and connect with recruiters</p>
        </div>

        <div className="career-landing-content">
          {/* Left Side: Cards */}
          <div className="career-cards-section">
            <div className="career-cards">
              {/* My Profile Card */}
              <Link to="/profile/career/edit" className="career-card">
                <div className="career-card-icon">
                  <i className="fa fa-user" />
                </div>
                <div className="career-card-content">
                  <h2>My Career Profile</h2>
                  <p>Update your bio, skills, and professional links</p>
                  <div className="profile-status">
                    <div className="status-bar">
                      <div className="status-fill" style={{ width: `${completeness}%` }} />
                    </div>
                    <span className="status-text">{completeness}% Complete</span>
                  </div>
                  {!isPublic && (
                    <span className="privacy-badge">
                      <i className="fa fa-lock" /> Private
                    </span>
                  )}
                </div>
                <i className="fa fa-chevron-right career-card-arrow" />
              </Link>

              {/* Recruitment Card */}
              <div className="career-card disabled">
                <div className="career-card-icon">
                  <i className="fa fa-briefcase" />
                </div>
                <div className="career-card-content">
                  <h2>Recruitment</h2>
                  <p>Connect with companies and explore job opportunities</p>
                  <span className="coming-soon-badge">Coming Soon</span>
                </div>
              </div>

              {/* Committee Applications Card */}
              <div className="career-card disabled">
                <div className="career-card-icon">
                  <i className="fa fa-users" />
                </div>
                <div className="career-card-content">
                  <h2>Committee Applications</h2>
                  <p>Apply to join ACM committees and officer positions</p>
                  <span className="coming-soon-badge">Coming Soon</span>
                </div>
              </div>

              {/* Resources Card */}
              <div className="career-card disabled">
                <div className="career-card-icon">
                  <i className="fa fa-book" />
                </div>
                <div className="career-card-content">
                  <h2>Career Resources</h2>
                  <p>Resume templates, interview tips, and career guides</p>
                  <span className="coming-soon-badge">Coming Soon</span>
                </div>
              </div>
            </div>

            {completeness < 100 && (
              <div className="career-tips">
                <h3>
                  <i className="fa fa-lightbulb" />
                  {' '}
                  Complete Your Profile
                </h3>
                <p>A complete profile helps recruiters and committee leads find you:</p>
                <ul>
                  {(!profile.bio || profile.bio.length < 50) && <li>Add a bio (at least 50 characters)</li>}
                  {(!profile.skills || profile.skills.length < 3) && <li>List at least 3 skills</li>}
                  {(!profile.careerInterests || profile.careerInterests.length < 2) && <li>Add 2+ career interests</li>}
                  {!profile.linkedinUrl && !profile.githubUrl && <li>Add your LinkedIn or GitHub</li>}
                  {!profile.portfolioUrl && !profile.personalWebsite && <li>Add a portfolio or personal website</li>}
                  {!profile.pronouns && <li>Add your pronouns</li>}
                </ul>
              </div>
            )}
          </div>

          {/* Right Side: Profile Preview */}
          <div className="profile-preview">
            <div className="preview-header">
              <h2>Your Career Profile</h2>
              <Link to="/profile/career/edit" className="edit-link">
                <i className="fa fa-edit" /> Edit
              </Link>
            </div>
            {completeness === 0 ? (
              <div className="preview-empty">
                <i className="fa fa-user-circle" />
                <p>Your career profile is empty.</p>
                <p>Fill it out to let recruiters and committee leads find you!</p>
                <Link to="/profile/career/edit" className="edit-link">
                  Get Started
                </Link>
              </div>
            ) : (
              <div className="preview-content">
                {profile.bio && (
                  <div className="preview-section">
                    <h3>Bio</h3>
                    <p>{profile.bio}</p>
                  </div>
                )}

                {profile.pronouns && (
                  <div className="preview-section">
                    <h3>Pronouns</h3>
                    <p>{profile.pronouns}</p>
                  </div>
                )}

                {profile.skills && profile.skills.length > 0 && (
                  <div className="preview-section">
                    <h3>Skills</h3>
                    <div className="tags">
                      {profile.skills.map((skill, index) => (
                        <span key={index} className="tag">{skill}</span>
                      ))}
                    </div>
                  </div>
                )}

                {profile.careerInterests && profile.careerInterests.length > 0 && (
                  <div className="preview-section">
                    <h3>Career Interests</h3>
                    <div className="tags">
                      {profile.careerInterests.map((interest, index) => (
                        <span key={index} className="tag">{interest}</span>
                      ))}
                    </div>
                  </div>
                )}

                {(profile.linkedinUrl || profile.githubUrl || profile.portfolioUrl || profile.personalWebsite || profile.resumeUrl) && (
                  <div className="preview-section">
                    <h3>Links</h3>
                    <div className="preview-links">
                      {profile.linkedinUrl && (
                        <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer" className="preview-link">
                          <i className="fab fa-linkedin" /> LinkedIn
                        </a>
                      )}
                      {profile.githubUrl && (
                        <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer" className="preview-link">
                          <i className="fab fa-github" /> GitHub
                        </a>
                      )}
                      {profile.portfolioUrl && (
                        <a href={profile.portfolioUrl} target="_blank" rel="noopener noreferrer" className="preview-link">
                          <i className="fa fa-folder" /> Portfolio
                        </a>
                      )}
                      {profile.personalWebsite && (
                        <a href={profile.personalWebsite} target="_blank" rel="noopener noreferrer" className="preview-link">
                          <i className="fa fa-globe" /> Website
                        </a>
                      )}
                      {profile.resumeUrl && (
                        <a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer" className="preview-link">
                          <i className="fa fa-file" /> Resume
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

CareerLanding.propTypes = {
  profile: PropTypes.object,
};

CareerLanding.defaultProps = {
  profile: {},
};
