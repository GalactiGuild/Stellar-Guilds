export interface ProfileCompletenessInput {
  avatarUrl?: string | null;
  bio?: string | null;
  displayName?: string | null;
  tags?: string[] | null;
}

export const ProfileUtil = {
  /**
   * Calculates profile completeness as an integer 0–100.
   * 25 points each for: Avatar, Bio, Display Name, at least 1 Tag.
   */
  calculateCompleteness(user: ProfileCompletenessInput): number {
    let score = 0;
    if (user.avatarUrl?.trim()) score += 25;
    if (user.bio?.trim()) score += 25;
    if (user.displayName?.trim()) score += 25;
    if (user.tags && user.tags.length > 0) score += 25;
    return score;
  },
};
