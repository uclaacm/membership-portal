"use client";

import React from "react";
import PropTypes from "prop-types";
import Link from "next/link";
import "./careerProfile.scss";

const isValidLinkedInUrl = url => {
  if (!url || url.trim() === "") return true;
  const linkedInPattern = /^https?:\/\/(www\.)?linkedin\.com\/in\/.+/i;
  return linkedInPattern.test(url);
};

const isValidGitHubUrl = url => {
  if (!url || url.trim() === "") return true;
  const gitHubPattern = /^https?:\/\/(www\.)?github\.com\/.+/i;
  return gitHubPattern.test(url);
};

const isValidUrl = url => {
  if (!url || url.trim() === "") return true;
  try {
    const parsedUrl = new URL(url);
    return !!parsedUrl;
  } catch (e) {
    return false;
  }
};

const getLinkedInUrlError = url => {
  if (!url || url.trim() === "") return null;
  if (!isValidUrl(url)) return "Please enter a valid URL";
  if (!isValidLinkedInUrl(url)) {
    return "LinkedIn URL must be in the format: https://linkedin.com/in/username";
  }
  return null;
};

const getGitHubUrlError = url => {
  if (!url || url.trim() === "") return null;
  if (!isValidUrl(url)) return "Please enter a valid URL";
  if (!isValidGitHubUrl(url)) {
    return "GitHub URL must be in the format: https://github.com/username";
  }
  return null;
};

class CareerProfile extends React.Component {
  constructor(props) {
    super(props);
    const { profile } = props;
    this.state = {
      bio: profile.bio || "",
      pronouns: profile.pronouns || "",
      linkedinUrl: profile.linkedinUrl || "",
      githubUrl: profile.githubUrl || "",
      portfolioUrl: profile.portfolioUrl || "",
      personalWebsite: profile.personalWebsite || "",
      resumeUrl: profile.resumeUrl || "",
      skills: profile.skills || [],
      careerInterests: profile.careerInterests || [],
      isProfilePublic: profile.isProfilePublic !== undefined ? profile.isProfilePublic : true,
      skillInput: "",
      careerInterestInput: "",
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
  }

  componentDidUpdate(prevProps) {
    const { profile } = this.props;
    if (prevProps.profile !== profile) {
      this.setState({
        bio: profile.bio || "",
        pronouns: profile.pronouns || "",
        linkedinUrl: profile.linkedinUrl || "",
        githubUrl: profile.githubUrl || "",
        portfolioUrl: profile.portfolioUrl || "",
        personalWebsite: profile.personalWebsite || "",
        resumeUrl: profile.resumeUrl || "",
        skills: profile.skills || [],
        careerInterests: profile.careerInterests || [],
      });
    }
  }

  handleInputChange(e) {
    const { name, value } = e.target;
    const { validationErrors } = this.state;
    this.setState({ [name]: value });

    if (validationErrors[name]) {
      this.setState(prevState => ({
        validationErrors: { ...prevState.validationErrors, [name]: null },
      }));
    }
  }

  handleBlur(e) {
    const { name, value } = e.target;
    const errors = {};

    // Validate LinkedIn URL
    if (name === "linkedinUrl") {
      const error = getLinkedInUrlError(value);
      if (error) errors.linkedinUrl = error;
    }

    // Validate GitHub URL
    if (name === "githubUrl") {
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

  async handleSubmit(e) {
    e.preventDefault();

    const {
      bio,
      pronouns,
      skills,
      careerInterests,
      isProfilePublic,
      linkedinUrl,
      githubUrl,
      portfolioUrl,
      personalWebsite,
      resumeUrl,
    } = this.state;

    const validationErrors = {};
    const linkedinError = getLinkedInUrlError(linkedinUrl);
    const githubError = getGitHubUrlError(githubUrl);

    if (linkedinError) validationErrors.linkedinUrl = linkedinError;
    if (githubError) validationErrors.githubUrl = githubError;

    if (Object.keys(validationErrors).length > 0) {
      this.setState({ validationErrors, saveError: "Please fix the validation errors before saving." });
      return;
    }

    this.setState({
      saving: true,
      saveError: null,
      saveSuccess: false,
      validationErrors: {},
    });

    const updates = {
      bio,
      pronouns,
      skills,
      careerInterests,
      isProfilePublic,
      // Required fields
      linkedinUrl,
      githubUrl,
      // Optional URL fields that can be cleared
      portfolioUrl,
      personalWebsite,
      resumeUrl,
    };

    try {
      const { updateCareerProfile } = this.props;
      const result = await updateCareerProfile(updates);
      if (!result?.success) {
        this.setState({ saving: false, saveError: result?.error || "Failed to save changes" });
        return;
      }

      this.setState({ saving: false, saveSuccess: true });
      setTimeout(() => {
        this.setState({ saveSuccess: false });
        if (typeof window !== "undefined") {
          window.location.href = "/profile/career";
        }
      }, 2000);
    } catch (error) {
      this.setState({ saving: false, saveError: error.message || "Failed to save changes" });
    }
  }

  addCareerInterest = e => {
    const { careerInterestInput, careerInterests } = this.state;
    if (e.key === "Enter" && careerInterestInput.trim()) {
      e.preventDefault();
      const newInterest = careerInterestInput.trim();
      if (careerInterests.length < 20 && !careerInterests.includes(newInterest)) {
        this.setState(prevState => ({
          careerInterests: [...prevState.careerInterests, newInterest],
          careerInterestInput: "",
        }));
      }
    }
  };

  removeCareerInterest = interestToRemove => {
    this.setState(prevState => ({
      careerInterests: prevState.careerInterests.filter(interest => interest !== interestToRemove),
    }));
  };

  addSkill(e) {
    const { skillInput, skills } = this.state;
    if (e.key === "Enter" && skillInput.trim()) {
      e.preventDefault();
      const newSkill = skillInput.trim();
      if (skills.length < 20 && !skills.includes(newSkill)) {
        this.setState(prevState => ({
          skills: [...prevState.skills, newSkill],
          skillInput: "",
        }));
      }
    }
  }

  removeSkill(skillToRemove) {
    this.setState(prevState => ({
      skills: prevState.skills.filter(skill => skill !== skillToRemove),
    }));
  }

  calculateCompleteness() {
    const { bio, skills, careerInterests, linkedinUrl, githubUrl, portfolioUrl, personalWebsite, pronouns } =
      this.state;

    let completed = 0;
    const total = 6;

    if (bio && bio.length >= 50) completed += 1;
    if (skills.length >= 3) completed += 1;
    if (careerInterests.length >= 2) completed += 1;
    if (linkedinUrl || githubUrl) completed += 1;
    if (portfolioUrl || personalWebsite) completed += 1;
    if (pronouns) completed += 1;

    return Math.round((completed / total) * 100);
  }

  render() {
    const completeness = this.calculateCompleteness();
    const {
      pronouns,
      bio,
      linkedinUrl,
      githubUrl,
      portfolioUrl,
      personalWebsite,
      resumeUrl,
      skills,
      careerInterests,
      isProfilePublic,
      skillInput,
      careerInterestInput,
      saveError,
      saveSuccess,
      saving,
      validationErrors,
    } = this.state;

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
                  <label htmlFor="pronouns">
                    Pronouns
                    <input
                      type="text"
                      id="pronouns"
                      name="pronouns"
                      value={pronouns}
                      onChange={this.handleInputChange}
                      placeholder="e.g., she/her, he/him, they/them"
                      maxLength={50}
                    />
                  </label>
                </div>

                <div className="form-group">
                  <label htmlFor="bio">
                    Bio
                    <span className="char-count">
                      {bio.length}
                      /1000
                    </span>
                    <textarea
                      id="bio"
                      name="bio"
                      value={bio}
                      onChange={this.handleInputChange}
                      placeholder="Tell us about yourself, your interests, and what you're working on..."
                      rows={6}
                      maxLength={1000}
                    />
                  </label>
                </div>
              </div>

              {/* Professional Links Section */}
              <div className="form-section">
                <h2>Professional Links</h2>

                <div className="form-group">
                  <label htmlFor="linkedinUrl">
                    <i className="fab fa-linkedin" /> LinkedIn
                    {linkedinUrl && !validationErrors.linkedinUrl && <span className="valid-check"> ✓</span>}
                    <input
                      type="url"
                      id="linkedinUrl"
                      name="linkedinUrl"
                      value={linkedinUrl}
                      onChange={this.handleInputChange}
                      onBlur={this.handleBlur}
                      placeholder="https://linkedin.com/in/yourprofile"
                      required
                      className={validationErrors.linkedinUrl ? "error" : ""}
                    />
                  </label>
                  {validationErrors.linkedinUrl && (
                    <span className="error-message">{validationErrors.linkedinUrl}</span>
                  )}
                  <p className="help-text">Example: https://linkedin.com/in/yourname</p>
                </div>

                <div className="form-group">
                  <label htmlFor="githubUrl">
                    <i className="fab fa-github" /> GitHub
                    {githubUrl && !validationErrors.githubUrl && <span className="valid-check"> ✓</span>}
                    <input
                      type="url"
                      id="githubUrl"
                      name="githubUrl"
                      value={githubUrl}
                      onChange={this.handleInputChange}
                      onBlur={this.handleBlur}
                      placeholder="https://github.com/yourusername"
                      required
                      className={validationErrors.githubUrl ? "error" : ""}
                    />
                  </label>
                  {validationErrors.githubUrl && <span className="error-message">{validationErrors.githubUrl}</span>}
                  <p className="help-text">Example: https://github.com/yourusername</p>
                </div>

                <div className="form-group">
                  <label htmlFor="portfolioUrl">
                    <i className="fa fa-briefcase" /> Portfolio
                    <span className="optional-label"> (Optional)</span>
                    <input
                      type="url"
                      id="portfolioUrl"
                      name="portfolioUrl"
                      value={portfolioUrl}
                      onChange={this.handleInputChange}
                      placeholder="https://yourportfolio.com"
                    />
                  </label>
                </div>

                <div className="form-group">
                  <label htmlFor="personalWebsite">
                    <i className="fa fa-globe" /> Personal Website
                    <span className="optional-label"> (Optional)</span>
                    <input
                      type="url"
                      id="personalWebsite"
                      name="personalWebsite"
                      value={personalWebsite}
                      onChange={this.handleInputChange}
                      placeholder="https://yourwebsite.com"
                    />
                  </label>
                </div>

                <div className="form-group">
                  <label htmlFor="resumeUrl">
                    <i className="fa fa-file-alt" /> Resume URL
                    <span className="optional-label"> (Optional)</span>
                    <input
                      type="url"
                      id="resumeUrl"
                      name="resumeUrl"
                      value={resumeUrl}
                      onChange={this.handleInputChange}
                      placeholder="https://drive.google.com/..."
                    />
                  </label>
                </div>
              </div>

              {/* Skills Section */}
              <div className="form-section">
                <h2>
                  Skills
                  <span className="count-badge">
                    {skills.length}
                    /20
                  </span>
                </h2>
                <p className="section-help">Add your technical and soft skills. Press Enter to add each skill.</p>

                <div className="form-group">
                  <input
                    type="text"
                    name="skillInput"
                    value={skillInput}
                    onChange={this.handleInputChange}
                    onKeyDown={this.addSkill}
                    placeholder="Type a skill and press Enter"
                    maxLength={50}
                    disabled={skills.length >= 20}
                  />
                </div>

                <div className="tags-container">
                  {skills.map(skill => (
                    <span key={skill} className="tag">
                      {skill}
                      <button type="button" onClick={() => this.removeSkill(skill)}>
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Career Interests Section */}
              <div className="form-section">
                <h2>
                  Career Interests
                  <span className="count-badge">
                    {careerInterests.length}
                    /20
                  </span>
                </h2>
                <p className="section-help">
                  What career fields or roles interest you? Press Enter to add each interest.
                </p>

                <div className="form-group">
                  <input
                    type="text"
                    name="careerInterestInput"
                    value={careerInterestInput}
                    onChange={this.handleInputChange}
                    onKeyDown={this.addCareerInterest}
                    placeholder="Type a career interest and press Enter"
                    maxLength={50}
                    disabled={careerInterests.length >= 20}
                  />
                </div>

                <div className="tags-container">
                  {careerInterests.map(interest => (
                    <span key={interest} className="tag">
                      {interest}
                      <button type="button" onClick={() => this.removeCareerInterest(interest)}>
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Privacy Section */}
              <div className="form-section">
                <h2>Privacy Settings</h2>

                <div className="toggle-group">
                  <label className="toggle-label" htmlFor="isProfilePublic">
                    <input
                      id="isProfilePublic"
                      type="checkbox"
                      checked={isProfilePublic}
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
                {saveError && (
                  <div className="error-message">
                    <i className="fa fa-exclamation-circle" /> {saveError}
                  </div>
                )}
                {saveSuccess && (
                  <div className="success-message">
                    <i className="fa fa-check-circle" /> Profile saved successfully!
                  </div>
                )}
                <button type="submit" className="save-button" disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
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
              <p className="progress-text">{completeness}% Complete</p>
              <ul className="completeness-checklist">
                <li className={bio && bio.length >= 50 ? "complete" : ""}>
                  {bio && bio.length >= 50 ? "✓" : "○"} Bio (50+ characters)
                </li>
                <li className={skills.length >= 3 ? "complete" : ""}>
                  {skills.length >= 3 ? "✓" : "○"} At least 3 skills
                </li>
                <li className={careerInterests.length >= 2 ? "complete" : ""}>
                  {careerInterests.length >= 2 ? "✓" : "○"} At least 2 career interests
                </li>
                <li className={linkedinUrl || githubUrl ? "complete" : ""}>
                  {linkedinUrl || githubUrl ? "✓" : "○"} Professional link
                </li>
                <li className={portfolioUrl || personalWebsite ? "complete" : ""}>
                  {portfolioUrl || personalWebsite ? "✓" : "○"} Portfolio/website
                </li>
                <li className={pronouns ? "complete" : ""}>{pronouns ? "✓" : "○"} Pronouns</li>
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
  profile: PropTypes.shape({
    bio: PropTypes.string,
    pronouns: PropTypes.string,
    linkedinUrl: PropTypes.string,
    githubUrl: PropTypes.string,
    portfolioUrl: PropTypes.string,
    personalWebsite: PropTypes.string,
    resumeUrl: PropTypes.string,
    skills: PropTypes.arrayOf(PropTypes.string),
    careerInterests: PropTypes.arrayOf(PropTypes.string),
    isProfilePublic: PropTypes.bool,
  }),
  updateCareerProfile: PropTypes.func.isRequired,
};

CareerProfile.defaultProps = {
  profile: {},
};
