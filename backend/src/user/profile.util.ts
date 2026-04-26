type ProfileInput = {
  avatarUrl?: string | null;
  profileBio?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  technicalTags?: string[];
};

/**
 * Calculates a user's profile completeness as an integer 0–100.
 *
 * Scoring:
 *   25 pts – Avatar uploaded
 *   25 pts – Bio filled in
 *   25 pts – Display name (firstName + lastName) present
 *   25 pts – At least one technical tag
 */
export class ProfileUtil {
  static calculateCompleteness(user: ProfileInput): number {
    let score = 0;
    if (user.avatarUrl?.trim()) score += 25;
    if (user.profileBio?.trim()) score += 25;
    if (user.firstName?.trim() && user.lastName?.trim()) score += 25;
    if (user.technicalTags && user.technicalTags.length > 0) score += 25;
    return score;
  }
}
