"use client";

import { useEffect, useState } from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Topbar from "@/components/Topbar";
import logoutUser from "@/app/actions/auth/logoutUser";
import updateCareerProfile from "@/app/actions/user/updateCareerProfile";
import fetchCareerProfile from "@/app/actions/user/fetchCareerProfile";
import { authUserProfileAtom, isAdminAtom, isOfficerAtom, adminViewAtom } from "@/lib/atoms";
import "./page.scss";

const normalizeUrl = url => {
  if (!url || url.trim() === "") return url;
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
};

const isValidLinkedInUrl = url => {
  if (!url || url.trim() === "") return true;
  const linkedInPattern = /^https?:\/\/(www\.)?linkedin\.com\/in\/.+/i;
  return linkedInPattern.test(normalizeUrl(url));
};

const isValidGitHubUrl = url => {
  if (!url || url.trim() === "") return true;
  const gitHubPattern = /^https?:\/\/(www\.)?github\.com\/.+/i;
  return gitHubPattern.test(normalizeUrl(url));
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

export default function CareerEditPage() {
  const router = useRouter();
  const userProfile = useAtomValue(authUserProfileAtom);
  const setAuthUserProfile = useSetAtom(authUserProfileAtom);
  const isAdmin = useAtomValue(isAdminAtom);
  const isOfficer = useAtomValue(isOfficerAtom);
  const [adminView, setAdminView] = useAtom(adminViewAtom);
  const [mounted, setMounted] = useState(false);
  const [careerProfile, setCareerProfile] = useState(userProfile || {});
  const [bio, setBio] = useState(userProfile?.bio || "");
  const [pronouns, setPronouns] = useState(userProfile?.pronouns || "");
  const [linkedinUrl, setLinkedinUrl] = useState(userProfile?.linkedinUrl || "");
  const [githubUrl, setGithubUrl] = useState(userProfile?.githubUrl || "");
  const [portfolioUrl, setPortfolioUrl] = useState(userProfile?.portfolioUrl || "");
  const [personalWebsite, setPersonalWebsite] = useState(userProfile?.personalWebsite || "");
  const [resumeUrl, setResumeUrl] = useState(userProfile?.resumeUrl || "");
  const [skills, setSkills] = useState(userProfile?.skills || []);
  const [careerInterests, setCareerInterests] = useState(userProfile?.careerInterests || []);
  const [isProfilePublic, setIsProfilePublic] = useState(
    userProfile?.isProfilePublic !== undefined ? userProfile.isProfilePublic : true,
  );
  const [skillInput, setSkillInput] = useState("");
  const [careerInterestInput, setCareerInterestInput] = useState("");
  const [saveState, setSaveState] = useState({
    saving: false,
    saveSuccess: false,
    saveError: null,
  });
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!userProfile) {
      return;
    }

    (async () => {
      const career = await fetchCareerProfile();
      if (career) {
        setCareerProfile({ ...(userProfile || {}), ...career });
      } else {
        setCareerProfile(userProfile || {});
      }
    })();
  }, [userProfile]);

  useEffect(() => {
    setBio(careerProfile.bio || "");
    setPronouns(careerProfile.pronouns || "");
    setLinkedinUrl(careerProfile.linkedinUrl || "");
    setGithubUrl(careerProfile.githubUrl || "");
    setPortfolioUrl(careerProfile.portfolioUrl || "");
    setPersonalWebsite(careerProfile.personalWebsite || "");
    setResumeUrl(careerProfile.resumeUrl || "");
    setSkills(careerProfile.skills || []);
    setCareerInterests(careerProfile.careerInterests || []);
    setIsProfilePublic(careerProfile.isProfilePublic !== undefined ? careerProfile.isProfilePublic : true);
  }, [careerProfile]);

  const handleLogout = async () => {
    await logoutUser();
  };

  const handleBlur = e => {
    const { name, value } = e.target;
    const errors = {};

    if (name === "linkedinUrl") {
      const error = getLinkedInUrlError(value);
      if (error) errors.linkedinUrl = error;
    }

    if (name === "githubUrl") {
      const error = getGitHubUrlError(value);
      if (error) errors.githubUrl = error;
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(prev => ({ ...prev, ...errors }));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();

    const validationErrors = {};
    const linkedinError = getLinkedInUrlError(linkedinUrl);
    const githubError = getGitHubUrlError(githubUrl);

    if (linkedinError) validationErrors.linkedinUrl = linkedinError;
    if (githubError) validationErrors.githubUrl = githubError;

    if (Object.keys(validationErrors).length > 0) {
      setValidationErrors(validationErrors);
      setSaveState(prev => ({ ...prev, saveError: "Please fix the validation errors before saving." }));
      return;
    }

    setSaveState({
      saving: true,
      saveSuccess: false,
      saveError: null,
    });
    setValidationErrors({});

    const updates = {
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
    };

    try {
      const result = await updateCareerProfile(updates);
      if (!result?.success) {
        setSaveState({
          saving: false,
          saveSuccess: false,
          saveError: result?.error || "Failed to save changes",
        });
        return;
      }

      setSaveState({ saving: false, saveSuccess: true, saveError: null });
      setAuthUserProfile(prev => ({
        ...(prev || {}),
        ...updates,
      }));
      setTimeout(() => {
        setSaveState(prev => ({ ...prev, saveSuccess: false }));
        router.push("/profile/career");
      }, 2000);
    } catch (error) {
      setSaveState({
        saving: false,
        saveSuccess: false,
        saveError: error.message || "Failed to save changes",
      });
    }
  };

  const addCareerInterest = e => {
    if (e.key === "Enter" && careerInterestInput.trim()) {
      e.preventDefault();
      const newInterest = careerInterestInput.trim();
      if (careerInterests.length < 20 && !careerInterests.includes(newInterest)) {
        setCareerInterests(prev => [...prev, newInterest]);
        setCareerInterestInput("");
      }
    }
  };

  const removeCareerInterest = interestToRemove => {
    setCareerInterests(prev => prev.filter(interest => interest !== interestToRemove));
  };

  const addSkill = e => {
    if (e.key === "Enter" && skillInput.trim()) {
      e.preventDefault();
      const newSkill = skillInput.trim();
      if (skills.length < 20 && !skills.includes(newSkill)) {
        setSkills(prev => [...prev, newSkill]);
        setSkillInput("");
      }
    }
  };

  const removeSkill = skillToRemove => {
    setSkills(prev => prev.filter(skill => skill !== skillToRemove));
  };

  const calculateCompleteness = () => {
    let completed = 0;
    const total = 6;

    if (bio && bio.length >= 50) completed += 1;
    if (skills.length >= 3) completed += 1;
    if (careerInterests.length >= 2) completed += 1;
    if (linkedinUrl || githubUrl) completed += 1;
    if (portfolioUrl || personalWebsite) completed += 1;
    if (pronouns) completed += 1;

    return Math.round((completed / total) * 100);
  };

  const completeness = calculateCompleteness();
  const { saving, saveSuccess, saveError } = saveState;

  if (!mounted) return null;

  return (
    <div>
      <Topbar
        isAdmin={adminView}
        picture={userProfile?.picture}
        onLogout={handleLogout}
        isRealAdmin={isAdmin}
        adminView={adminView}
        onToggleAdminView={() => setAdminView(v => !v)}
        isOfficer={isOfficer}
        officerView={adminView}
        onToggleOfficerView={() => setAdminView(v => !v)}
      />
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
          <div className="career-profile-content">
            <form onSubmit={handleSubmit}>
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
                      onChange={e => setPronouns(e.target.value)}
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
                      onChange={e => setBio(e.target.value)}
                      placeholder="Tell us about yourself, your interests, and what you're working on..."
                      rows={6}
                      maxLength={1000}
                    />
                  </label>
                </div>
              </div>

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
                      onChange={e => {
                        setLinkedinUrl(e.target.value);
                        if (validationErrors.linkedinUrl) {
                          setValidationErrors(prev => ({ ...prev, linkedinUrl: null }));
                        }
                      }}
                      onBlur={handleBlur}
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
                      onChange={e => {
                        setGithubUrl(e.target.value);
                        if (validationErrors.githubUrl) {
                          setValidationErrors(prev => ({ ...prev, githubUrl: null }));
                        }
                      }}
                      onBlur={handleBlur}
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
                      onChange={e => setPortfolioUrl(e.target.value)}
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
                      onChange={e => setPersonalWebsite(e.target.value)}
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
                      onChange={e => setResumeUrl(e.target.value)}
                      placeholder="https://drive.google.com/..."
                    />
                  </label>
                </div>
              </div>

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
                    onChange={e => setSkillInput(e.target.value)}
                    onKeyDown={addSkill}
                    placeholder="Type a skill and press Enter"
                    maxLength={50}
                    disabled={skills.length >= 20}
                  />
                </div>

                <div className="tags-container">
                  {skills.map(skill => (
                    <span key={skill} className="tag">
                      {skill}
                      <button type="button" onClick={() => removeSkill(skill)}>
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

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
                    onChange={e => setCareerInterestInput(e.target.value)}
                    onKeyDown={addCareerInterest}
                    placeholder="Type a career interest and press Enter"
                    maxLength={50}
                    disabled={careerInterests.length >= 20}
                  />
                </div>

                <div className="tags-container">
                  {careerInterests.map(interest => (
                    <span key={interest} className="tag">
                      {interest}
                      <button type="button" onClick={() => removeCareerInterest(interest)}>
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="form-section">
                <h2>Privacy Settings</h2>

                <div className="toggle-group">
                  <label className="toggle-label" htmlFor="isProfilePublic">
                    <input
                      id="isProfilePublic"
                      type="checkbox"
                      checked={isProfilePublic}
                      onChange={e => setIsProfilePublic(e.target.checked)}
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
    </div>
  );
}
