export interface UserPublicProfile {
  firstName: string;
  lastName: string;
  picture: string;
  points: number;
}

export interface UserExtendedProfile extends UserPublicProfile {
  uuid: string;
  email: string;
  year: number;
  major: string;
  committees?: string[];
  bio?: string;
  pronouns?: string;
  skills?: string[];
  careerInterests?: string[];
  isProfilePublic?: boolean;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  personalWebsite?: string;
  resumeUrl?: string;
}
