export interface UserPublicProfile {
  firstName: string;
  lastName: string;
  picture: string;
  points: number;
}

export interface UserExtendedProfile extends UserPublicProfile {
  email: string;
  year: number;
  major: string;
}
