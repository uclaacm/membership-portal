'use client';

import React from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import './careerProfile.scss';

const normalizeUrl = (url) => {
  if (!url || url.trim() === '') return url;
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
};

const isValidLinkedInUrl = (url) => {
  if (!url || url.trim() === '') return true;
  const linkedInPattern = /^https?:\/\/(www\.)?linkedin\.com\/in\/.+/i;
  return linkedInPattern.test(normalizeUrl(url));
};

const isValidGitHubUrl = (url) => {
  if (!url || url.trim() === '') return true;
  const gitHubPattern = /^https?:\/\/(www\.)?github\.com\/.+/i;
  return gitHubPattern.test(normalizeUrl(url));
};

const isValidUrl = (url) => {
  if (!url || url.trim() === '') return true;
  try {
    new URL(normalizeUrl(url));
    return true;
  } catch (e) {
    return false;
  }
};

const getLinkedInUrlError = (url) => {
  if (!url || url.trim() === '') return null;
  if (!isValidUrl(url)) return 'Please enter a valid URL';
  if (!isValidLinkedInUrl(url)) {
    return 'LinkedIn URL must be in the format: linkedin.com/in/username';
  }
  return null;
};

const getGitHubUrlError = (url) => {
  if (!url || url.trim() === '') return null;
  if (!isValidUrl(url)) return 'Please enter a valid URL';
  if (!isValidGitHubUrl(url)) {
    return 'GitHub URL must be in the format: github.com/username';
  }
  return null;
};

class CareerProfile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      bio: props.profile.bio || '',
      pronouns: props.profile.pronouns || '',
      linkedinUrl: props.profile.linkedinUrl || '',
      githubUrl: props.profile.githubUrl || '',
      portfolioUrl: props.profile.portfolioUrl || '',
      personalWebsite: props.profile.personalWebsite || '',
      resumeUrl: props.profile.resumeUrl || '',
      skills: props.profile.skills || [],
      careerInterests: props.profile.careerInterests || [],
      isProfilePublic: props.profile.isProfilePublic !== undefined ? props.profile.isProfilePublic : true,
      skillInput: '',
      careerInterestInput: '',
      saving: false,
      saveSuccess: false,
      saveError: null,
      validationErrors: {},
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    this.handleToggle = this.handleToggle.bind(this);
    this.addSkill = this.addSkill.bind(this);
    this.removeSkill = this.removeSkill.bind(this);
    this.addCareerInterest = this.addCareerInterest.bind(this);
    this.removeCareerInterest = this.removeCareerInterest.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.profile !== this.props.profile) {
      this.setState({
        bio: this.props.profile.bio || '',
        pronouns: this.props.profile.pronouns || '',
        linkedinUrl: this.props.profile.linkedinUrl || '',
        githubUrl: this.props.profile.githubUrl || '',
        portfolioUrl: this.props.profile.portfolioUrl || '',
        personalWebsite: this.props.profile.personalWebsite || '',
        resumeUrl: this.props.profile.resumeUrl || '',
        skills: this.props.profile.skills || [],
        careerInterests: this.props.profile.careerInterests || [],
      });
    }
  }

  handleInputChange(e) {
    const { name, value } = e.target;
    this.setState({ [name]: value });

    if (this.state.validationErrors[name]) {
      this.setState(prevState => ({
        validationErrors: { ...prevState.validationErrors, [name]: null },
      }));
    }
  }

  handleBlur(e) {
    const { name, value } = e.target;
    const errors = {};

    // Validate LinkedIn URL
    if (name === 'linkedinUrl') {
      const error = getLinkedInUrlError(value);
      if (error) errors.linkedinUrl = error;
    }

    // Validate GitHub URL
    if (name === 'githubUrl') {
      const error = getGitHubUrlError(value);
      if (error) errors.githubUrl = error;
    }

    if (Object.keys(errors).length > 0) {
      this.setState(prevState => ({
        validationErrors: { ...prevState.validationErrors, ...errors },
      }));
    }
  }

  handleToggle() {
    this.setState(prevState => ({ isProfilePublic: !prevState.isProfilePublic }));
  }

  addSkill(e) {
    if (e.key === 'Enter' && this.state.skillInput.trim()) {
      e.preventDefault();
      const newSkill = this.state.skillInput.trim();
      if (this.state.skills.length < 20 && !this.state.skills.includes(newSkill)) {
        this.setState(prevState => ({
          skills: [...prevState.skills, newSkill],
          skillInput: '',
        }));
      }
    }
  }

  removeSkill(skillToRemove) {
    this.setState(prevState => ({
      skills: prevState.skills.filter(skill => skill !== skillToRemove),
    }));
  }

  addCareerInterest(e) {
    if (e.key === 'Enter' && this.state.careerInterestInput.trim()) {
      e.preventDefault();
      const newInterest = this.state.careerInterestInput.trim();
      if (this.state.careerInterests.length < 20 && !this.state.careerInterests.includes(newInterest)) {
        this.setState(prevState => ({
          careerInterests: [...prevState.careerInterests, newInterest],
          careerInterestInput: '',
        }));
      }
    }
  }

  removeCareerInterest(interestToRemove) {
    this.setState(prevState => ({
      careerInterests: prevState.careerInterests.filter(interest => interest !== interestToRemove),
    }));
  }

  async handleSubmit(e) {
    e.preventDefault();

    const validationErrors = {};
    const linkedinError = getLinkedInUrlError(this.state.linkedinUrl);
    const githubError = getGitHubUrlError(this.state.githubUrl);

    if (linkedinError) validationErrors.linkedinUrl = linkedinError;
    if (githubError) validationErrors.githubUrl = githubError;

    if (Object.keys(validationErrors).length > 0) {
      this.setState({ validationErrors, saveError: 'Please fix the validation errors before saving.' });
      return;
    }

    this.setState({
      saving: true, saveError: null, saveSuccess: false, validationErrors: {},
    });

    const updates = {
      bio: this.state.bio,
      pronouns: this.state.pronouns,
      skills: this.state.skills,
      careerInterests: this.state.careerInterests,
      isProfilePublic: this.state.isProfilePublic,
      // Required fields
      linkedinUrl: normalizeUrl(this.state.linkedinUrl),
      githubUrl: normalizeUrl(this.state.githubUrl),
      // Optional URL fields that can be cleared
      portfolioUrl: normalizeUrl(this.state.portfolioUrl),
      personalWebsite: normalizeUrl(this.state.personalWebsite),
      resumeUrl: normalizeUrl(this.state.resumeUrl),
    };

    try {
      await this.props.updateCareerProfile(updates);
      this.setState({ saving: false, saveSuccess: true });
      setTimeout(() => {
        this.setState({ saveSuccess: false });
        this.props.history.push('/profile/career');
      }, 2000);
    } catch (error) {
      this.setState({ saving: false, saveError: error.message || 'Failed to save changes' });
    }
  }

  calculateCompleteness() {
    let completed = 0;
    const total = 6;

    if (this.state.bio && this.state.bio.length >= 50) completed++;
    if (this.state.skills.length >= 3) completed++;
    if (this.state.careerInterests.length >= 2) completed++;
    if (this.state.linkedinUrl || this.state.githubUrl) completed++;
    if (this.state.portfolioUrl || this.state.personalWebsite) completed++;
    if (this.state.pronouns) completed++;

    return Math.round((completed / total) * 100);
  }

  render() {
    const completeness = this.calculateCompleteness();

    return (
      <div className="career-profile-page">
        <div className="career-profile-header">
          <Link href="/profile/career" className="back-link">
            <i className="fa fa-arrow-left" />
            <span>Back to Career Hub</span>
          </Link>
          <h1>Edit Career Profile</h1>
          <p className="subtitle">Showcase your skills and experience to the ACM community</p>
        </div>

        <div className="career-profile-container">
          {/* Left Side: Form */}
          <div className="career-profile-content">
            <form onSubmit={this.handleSubmit}>
              {/* Basic Info Section */}
              <div className="form-section">
                <h2>Basic Information</h2>

                <div className="form-group">
                  <label htmlFor="pronouns">Pronouns</label>
                  <input
                    type="text"
                    id="pronouns"
                    name="pronouns"
                    value={this.state.pronouns}
                    onChange={this.handleInputChange}
                    placeholder="e.g., she/her, he/him, they/them"
                    maxLength={50}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="bio">
                    Bio
                    <span className="char-count">
                      {this.state.bio.length}
                      /1000
                    </span>
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={this.state.bio}
                    onChange={this.handleInputChange}
                    placeholder="Tell us about yourself, your interests, and what you're working on..."
                    rows={6}
                    maxLength={1000}
                  />
                </div>
              </div>

              {/* Professional Links Section */}
              <div className="form-section">
                <h2>Professional Links</h2>

                <div className="form-group">
                  <label htmlFor="linkedinUrl">
                    <i className="fab fa-linkedin" />
                    {' '}
                    LinkedIn
                    {this.state.linkedinUrl && !this.state.validationErrors.linkedinUrl && <span className="valid-check"> ✓</span>}
                  </label>
                  <input
                    type="url"
                    id="linkedinUrl"
                    name="linkedinUrl"
                    value={this.state.linkedinUrl}
                    onChange={this.handleInputChange}
                    onBlur={this.handleBlur}
                    placeholder="https://linkedin.com/in/yourprofile"
                    required
                    className={this.state.validationErrors.linkedinUrl ? 'error' : ''}
                  />
                  {this.state.validationErrors.linkedinUrl && (
                    <span className="error-message">{this.state.validationErrors.linkedinUrl}</span>
                  )}
                  <p className="help-text">Example: https://linkedin.com/in/yourname</p>
                </div>

                <div className="form-group">
                  <label htmlFor="githubUrl">
                    <i className="fab fa-github" />
                    {' '}
                    GitHub
                    {this.state.githubUrl && !this.state.validationErrors.githubUrl && <span className="valid-check"> ✓</span>}
                  </label>
                  <input
                    type="url"
                    id="githubUrl"
                    name="githubUrl"
                    value={this.state.githubUrl}
                    onChange={this.handleInputChange}
                    onBlur={this.handleBlur}
                    placeholder="https://github.com/yourusername"
                    required
                    className={this.state.validationErrors.githubUrl ? 'error' : ''}
                  />
                  {this.state.validationErrors.githubUrl && (
                    <span className="error-message">{this.state.validationErrors.githubUrl}</span>
                  )}
                  <p className="help-text">Example: https://github.com/yourusername</p>
                </div>

                <div className="form-group">
                  <label htmlFor="portfolioUrl">
                    <i className="fa fa-briefcase" />
                    {' '}
                    Portfolio
                    <span className="optional-label"> (Optional)</span>
                  </label>
                  <input
                    type="url"
                    id="portfolioUrl"
                    name="portfolioUrl"
                    value={this.state.portfolioUrl}
                    onChange={this.handleInputChange}
                    placeholder="https://yourportfolio.com"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="personalWebsite">
                    <i className="fa fa-globe" />
                    {' '}
                    Personal Website
                    <span className="optional-label"> (Optional)</span>
                  </label>
                  <input
                    type="url"
                    id="personalWebsite"
                    name="personalWebsite"
                    value={this.state.personalWebsite}
                    onChange={this.handleInputChange}
                    placeholder="https://yourwebsite.com"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="resumeUrl">
                    <i className="fa fa-file-alt" />
                    {' '}
                    Resume URL
                    <span className="optional-label"> (Optional)</span>
                  </label>
                  <input
                    type="url"
                    id="resumeUrl"
                    name="resumeUrl"
                    value={this.state.resumeUrl}
                    onChange={this.handleInputChange}
                    placeholder="https://drive.google.com/..."
                  />
                </div>
              </div>

              {/* Skills Section */}
              <div className="form-section">
                <h2>
                  Skills
                  <span className="count-badge">
                    {this.state.skills.length}
                    /20
                  </span>
                </h2>
                <p className="section-help">Add your technical and soft skills. Press Enter to add each skill.</p>

                <div className="form-group">
                  <input
                    type="text"
                    name="skillInput"
                    value={this.state.skillInput}
                    onChange={this.handleInputChange}
                    onKeyDown={this.addSkill}
                    placeholder="Type a skill and press Enter"
                    maxLength={50}
                    disabled={this.state.skills.length >= 20}
                  />
                </div>

                <div className="tags-container">
                  {this.state.skills.map(skill => (
                    <span key={skill} className="tag">
                      {skill}
                      <button type="button" onClick={() => this.removeSkill(skill)}>×</button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Career Interests Section */}
              <div className="form-section">
                <h2>
                  Career Interests
                  <span className="count-badge">
                    {this.state.careerInterests.length}
                    /20
                  </span>
                </h2>
                <p className="section-help">What career fields or roles interest you? Press Enter to add each interest.</p>

                <div className="form-group">
                  <input
                    type="text"
                    name="careerInterestInput"
                    value={this.state.careerInterestInput}
                    onChange={this.handleInputChange}
                    onKeyDown={this.addCareerInterest}
                    placeholder="Type a career interest and press Enter"
                    maxLength={50}
                    disabled={this.state.careerInterests.length >= 20}
                  />
                </div>

                <div className="tags-container">
                  {this.state.careerInterests.map(interest => (
                    <span key={interest} className="tag">
                      {interest}
                      <button type="button" onClick={() => this.removeCareerInterest(interest)}>×</button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Privacy Section */}
              <div className="form-section">
                <h2>Privacy Settings</h2>

                <div className="toggle-group">
                  <label className="toggle-label">
                    <input
                      type="checkbox"
                      checked={this.state.isProfilePublic}
                      onChange={this.handleToggle}
                    />
                    <span className="toggle-switch" />
                    <span className="toggle-text">
                      Make my career profile public
                      <span className="toggle-description">
                        Allow other ACM members and recruiters to view your career profile in the directory
                      </span>
                    </span>
                  </label>
                </div>
              </div>

              {/* Save Button */}
              <div className="form-actions">
                {this.state.saveError && (
                  <div className="error-message">
                    <i className="fa fa-exclamation-circle" />
                    {' '}
                    {this.state.saveError}
                  </div>
                )}
                {this.state.saveSuccess && (
                  <div className="success-message">
                    <i className="fa fa-check-circle" />
                    {' '}
                    Profile saved successfully!
                  </div>
                )}
                <button type="submit" className="save-button" disabled={this.state.saving}>
                  {this.state.saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>

          {/* Right Side: Stats & Tips */}
          <div className="career-profile-sidebar">
            <div className="info-card">
              <h3>Profile Completeness</h3>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${completeness}%` }} />
              </div>
              <p className="progress-text">
                {completeness}
                % Complete
              </p>
              <ul className="completeness-checklist">
                <li className={this.state.bio && this.state.bio.length >= 50 ? 'complete' : ''}>
                  {this.state.bio && this.state.bio.length >= 50 ? '✓' : '○'}
                  {' '}
                  Bio (50+ characters)
                </li>
                <li className={this.state.skills.length >= 3 ? 'complete' : ''}>
                  {this.state.skills.length >= 3 ? '✓' : '○'}
                  {' '}
                  At least 3 skills
                </li>
                <li className={this.state.careerInterests.length >= 2 ? 'complete' : ''}>
                  {this.state.careerInterests.length >= 2 ? '✓' : '○'}
                  {' '}
                  At least 2 career interests
                </li>
                <li className={this.state.linkedinUrl || this.state.githubUrl ? 'complete' : ''}>
                  {this.state.linkedinUrl || this.state.githubUrl ? '✓' : '○'}
                  {' '}
                  Professional link
                </li>
                <li className={this.state.portfolioUrl || this.state.personalWebsite ? 'complete' : ''}>
                  {this.state.portfolioUrl || this.state.personalWebsite ? '✓' : '○'}
                  {' '}
                  Portfolio/website
                </li>
                <li className={this.state.pronouns ? 'complete' : ''}>
                  {this.state.pronouns ? '✓' : '○'}
                  {' '}
                  Pronouns
                </li>
              </ul>
            </div>

            <div className="info-card">
              <h3>📈 Profile Tips</h3>
              <ul>
                <li>Write a compelling bio that highlights your interests</li>
                <li>Add specific, relevant skills</li>
                <li>Include links to your best work</li>
                <li>Make your profile public to increase networking opportunities</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default CareerProfile;

CareerProfile.propTypes = {
  profile: PropTypes.object,
  updateCareerProfile: PropTypes.func.isRequired,
};

CareerProfile.defaultProps = {
  profile: {},
};
