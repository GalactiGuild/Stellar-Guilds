export interface UserProfileData {
  firstName?: string | null;
  lastName?: string | null;
  bio?: string | null;
  location?: string | null;
  profileBio?: string | null;
  profileUrl?: string | null;
  discordHandle?: string | null;
  twitterHandle?: string | null;
  githubHandle?: string | null;
  avatarUrl?: string | null;
  backgroundCid?: string | null;
}

/**
 * Calculate profile completeness percentage based on filled fields
 * Returns a number between 0 and 100
 */
export class ProfileUtil {
  private static readonly PROFILE_FIELDS: (keyof UserProfileData)[] = [
    'firstName',
    'lastName',
    'bio',
    'location',
    'profileBio',
    'profileUrl',
    'discordHandle',
    'twitterHandle',
    'githubHandle',
    'avatarUrl',
    'backgroundCid',
  ];

  static calculateCompleteness(profile: UserProfileData): number {
    const totalFields = this.PROFILE_FIELDS.length;
    const filledFields = this.PROFILE_FIELDS.filter((field) => {
      const value = profile[field];
      return value !== null && value !== undefined && value !== '';
    }).length;

    return Math.round((filledFields / totalFields) * 100);
  }
}
