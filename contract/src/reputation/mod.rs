pub mod achievements;
pub mod scoring;
pub mod storage;
pub mod types;

#[cfg(test)]
mod tests;

#[cfg(test)]
mod integration_tests;

use soroban_sdk::{Address, Env, Vec};

use self::achievements::{check_eligibility, get_contributor_achievements, has_achievement, initialize_default_achievements};
use self::scoring::{
    apply_score_change, calculate_incentive_multiplier, calculate_score_change,
    calculate_success_rate, calculate_tier, calculate_time_decay,
};
use self::storage::{
    get_profile, get_top_contributors, has_profile, initialize_reputation_storage, set_profile,
    update_leaderboard, get_achievement,
};
use self::types::{
    Achievement, AchievementAwardedEvent, ProfileInitializedEvent, ReputationEvent,
    ReputationProfile, ReputationTier, ReputationUpdatedEvent, TierUpgradedEvent,
};

// ============ Core Reputation Functions ============

/// Initialize a reputation profile for a contributor
///
/// # Arguments
/// * `env` - The contract environment
/// * `address` - The address of the contributor
///
/// # Returns
/// * `ReputationProfile` - The newly created profile
pub fn initialize_profile(env: &Env, address: Address) -> ReputationProfile {
    // Check if profile already exists
    if has_profile(env, &address) {
        panic!("Profile already exists");
    }

    let current_time = env.ledger().timestamp();

    let profile = ReputationProfile {
        address: address.clone(),
        score: 0,
        tier: ReputationTier::Bronze,
        tasks_completed: 0,
        tasks_failed: 0,
        success_rate: 100, // Default to 100% for new users
        achievements: Vec::new(env),
        last_activity: current_time,
        created_at: current_time,
        disputes_won: 0,
        disputes_lost: 0,
        milestones_completed: 0,
    };

    set_profile(env, &profile);

    // Emit event
    env.events().publish(
        (soroban_sdk::symbol_short!("REP_INIT"),),
        ProfileInitializedEvent {
            address: address.clone(),
            initial_score: 0,
            tier: ReputationTier::Bronze,
            timestamp: current_time,
        },
    );

    profile
}

/// Update reputation based on an event
///
/// # Arguments
/// * `env` - The contract environment
/// * `address` - The address of the contributor
/// * `event` - The type of reputation event
/// * `value` - Context-specific value (complexity, significance, etc.)
///
/// # Returns
/// * `u32` - The new reputation score
pub fn update_reputation(
    env: &Env,
    address: Address,
    event: ReputationEvent,
    value: u32,
) -> u32 {
    // Get or create profile
    let mut profile = match get_profile(env, &address) {
        Some(p) => p,
        None => initialize_profile(env, address.clone()),
    };

    let old_score = profile.score;
    let old_tier = profile.tier;

    // Update activity tracking based on event
    match event {
        ReputationEvent::TaskCompleted => {
            profile.tasks_completed += 1;
        }
        ReputationEvent::TaskFailed => {
            profile.tasks_failed += 1;
        }
        ReputationEvent::DisputeWon => {
            profile.disputes_won += 1;
        }
        ReputationEvent::DisputeLost => {
            profile.disputes_lost += 1;
        }
        ReputationEvent::MilestoneAchieved => {
            profile.milestones_completed += 1;
        }
        _ => {}
    }

    // Recalculate success rate
    profile.success_rate = calculate_success_rate(profile.tasks_completed, profile.tasks_failed);

    // Calculate score change
    let score_change = calculate_score_change(event, value, profile.score);

    // Apply score change (with bounds checking)
    profile.score = apply_score_change(profile.score, score_change);

    // Recalculate tier
    profile.tier = calculate_tier(profile.score);

    // Update last activity
    profile.last_activity = env.ledger().timestamp();

    // Save updated profile
    set_profile(env, &profile);

    // Emit reputation updated event
    env.events().publish(
        (soroban_sdk::symbol_short!("REP_UPD"),),
        ReputationUpdatedEvent {
            address: address.clone(),
            event_type: event,
            old_score,
            new_score: profile.score,
            old_tier,
            new_tier: profile.tier,
            timestamp: env.ledger().timestamp(),
        },
    );

    // Emit tier upgrade event if tier changed
    if old_tier != profile.tier {
        env.events().publish(
            (soroban_sdk::symbol_short!("TIER_UP"),),
            TierUpgradedEvent {
                address,
                old_tier,
                new_tier: profile.tier,
                current_score: profile.score,
                timestamp: env.ledger().timestamp(),
            },
        );
    }

    profile.score
}

/// Award an achievement to a contributor
///
/// # Arguments
/// * `env` - The contract environment
/// * `address` - The address of the contributor
/// * `achievement_id` - The ID of the achievement to award
///
/// # Returns
/// * `bool` - true if the achievement was awarded successfully
pub fn award_achievement(env: &Env, address: Address, achievement_id: u64) -> bool {
    // Get profile
    let mut profile = match get_profile(env, &address) {
        Some(p) => p,
        None => return false,
    };

    // Check if already has achievement
    if has_achievement(&profile, achievement_id) {
        return false;
    }

    // Check eligibility
    if !check_eligibility(env, &profile, achievement_id) {
        return false;
    }

    // Get achievement details
    let achievement = match get_achievement(env, achievement_id) {
        Some(ach) => ach,
        None => return false,
    };

    // Add achievement to profile
    profile.achievements.push_back(achievement_id);

    // Add achievement points to reputation score
    let old_score = profile.score;
    profile.score = profile.score.saturating_add(achievement.points);

    // Recalculate tier
    let old_tier = profile.tier;
    profile.tier = calculate_tier(profile.score);

    // Save updated profile
    set_profile(env, &profile);

    // Emit achievement awarded event
    env.events().publish(
        (soroban_sdk::symbol_short!("ACH_AWD"),),
        AchievementAwardedEvent {
            address: address.clone(),
            achievement_id,
            achievement_name: achievement.name.clone(),
            points_awarded: achievement.points,
            timestamp: env.ledger().timestamp(),
        },
    );

    // Emit tier upgrade event if tier changed
    if old_tier != profile.tier {
        env.events().publish(
            (soroban_sdk::symbol_short!("TIER_UP"),),
            TierUpgradedEvent {
                address,
                old_tier,
                new_tier: profile.tier,
                current_score: profile.score,
                timestamp: env.ledger().timestamp(),
            },
        );
    }

    true
}

/// Get the reputation profile for a contributor
///
/// # Arguments
/// * `env` - The contract environment
/// * `address` - The address of the contributor
///
/// # Returns
/// * `ReputationProfile` - The contributor's reputation profile
pub fn get_reputation(env: &Env, address: Address) -> ReputationProfile {
    match get_profile(env, &address) {
        Some(profile) => profile,
        None => panic!("Profile not found"),
    }
}

/// Get the reputation tier for a contributor
///
/// # Arguments
/// * `env` - The contract environment
/// * `address` - The address of the contributor
///
/// # Returns
/// * `ReputationTier` - The contributor's current tier
pub fn get_tier(env: &Env, address: Address) -> ReputationTier {
    match get_profile(env, &address) {
        Some(profile) => profile.tier,
        None => ReputationTier::Bronze,
    }
}

/// Calculate the incentive multiplier for a contributor
///
/// # Arguments
/// * `env` - The contract environment
/// * `address` - The address of the contributor
///
/// # Returns
/// * `u32` - The incentive multiplier in basis points (100 = 1.0x)
pub fn calculate_multiplier(env: &Env, address: Address) -> u32 {
    let tier = get_tier(env, address);
    calculate_incentive_multiplier(tier)
}

/// Get top contributors for a guild
///
/// # Arguments
/// * `env` - The contract environment
/// * `guild_id` - The ID of the guild
/// * `limit` - Maximum number of contributors to return
///
/// # Returns
/// * `Vec<Address>` - List of top contributor addresses
pub fn get_top_contributors_for_guild(env: &Env, guild_id: u64, limit: u32) -> Vec<Address> {
    get_top_contributors(env, guild_id, limit)
}

/// Check if a contributor is eligible for a specific achievement
///
/// # Arguments
/// * `env` - The contract environment
/// * `address` - The address of the contributor
/// * `achievement_id` - The ID of the achievement
///
/// # Returns
/// * `bool` - true if the contributor is eligible
pub fn check_achievement_eligibility(env: &Env, address: Address, achievement_id: u64) -> bool {
    match get_profile(env, &address) {
        Some(profile) => check_eligibility(env, &profile, achievement_id),
        None => false,
    }
}

/// Get all achievements earned by a contributor
///
/// # Arguments
/// * `env` - The contract environment
/// * `address` - The address of the contributor
///
/// # Returns
/// * `Vec<Achievement>` - List of earned achievements
pub fn get_achievements(env: &Env, address: Address) -> Vec<Achievement> {
    match get_profile(env, &address) {
        Some(profile) => get_contributor_achievements(env, &profile),
        None => Vec::new(env),
    }
}

/// Update guild leaderboard for a contributor
///
/// # Arguments
/// * `env` - The contract environment
/// * `guild_id` - The ID of the guild
/// * `address` - The address of the contributor
pub fn update_guild_leaderboard(env: &Env, guild_id: u64, address: &Address) {
    if let Some(profile) = get_profile(env, address) {
        update_leaderboard(env, guild_id, address, profile.score);
    }
}

/// Apply time decay to a contributor's reputation
///
/// # Arguments
/// * `env` - The contract environment
/// * `address` - The address of the contributor
///
/// # Returns
/// * `u32` - The new reputation score after decay
pub fn apply_time_decay(env: &Env, address: Address) -> u32 {
    let mut profile = match get_profile(env, &address) {
        Some(p) => p,
        None => return 0,
    };

    let old_score = profile.score;
    let decay_amount = calculate_time_decay(env, profile.last_activity, profile.score);

    if decay_amount > 0 {
        let old_tier = profile.tier;
        profile.score = if decay_amount > profile.score {
            0
        } else {
            profile.score - decay_amount
        };

        profile.tier = calculate_tier(profile.score);

        set_profile(env, &profile);

        // Emit reputation updated event
        env.events().publish(
            (soroban_sdk::symbol_short!("REP_UPD"),),
            ReputationUpdatedEvent {
                address: address.clone(),
                event_type: ReputationEvent::TimeDecay,
                old_score,
                new_score: profile.score,
                old_tier,
                new_tier: profile.tier,
                timestamp: env.ledger().timestamp(),
            },
        );
    }

    profile.score
}

/// Initialize reputation system (call once during contract deployment)
pub fn initialize_reputation_system(env: &Env) {
    initialize_reputation_storage(env);
    initialize_default_achievements(env);
}

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::testutils::Address as _;

    #[test]
    fn test_initialize_profile() {
        let env = Env::default();
        env.budget().reset_unlimited();

        initialize_reputation_system(&env);

        let address = Address::generate(&env);
        let profile = initialize_profile(&env, address.clone());

        assert_eq!(profile.address, address);
        assert_eq!(profile.score, 0);
        assert_eq!(profile.tier, ReputationTier::Bronze);
        assert_eq!(profile.tasks_completed, 0);
        assert_eq!(profile.tasks_failed, 0);
        assert_eq!(profile.success_rate, 100);
    }

    #[test]
    #[should_panic(expected = "Profile already exists")]
    fn test_initialize_profile_duplicate() {
        let env = Env::default();
        env.budget().reset_unlimited();

        initialize_reputation_system(&env);

        let address = Address::generate(&env);
        initialize_profile(&env, address.clone());
        initialize_profile(&env, address); // Should panic
    }

    #[test]
    fn test_update_reputation_task_completed() {
        let env = Env::default();
        env.budget().reset_unlimited();

        initialize_reputation_system(&env);

        let address = Address::generate(&env);

        // Complete a task with complexity 3
        let new_score = update_reputation(&env, address.clone(), ReputationEvent::TaskCompleted, 3);

        assert_eq!(new_score, 30); // 10 * 3

        let profile = get_reputation(&env, address);
        assert_eq!(profile.tasks_completed, 1);
        assert_eq!(profile.success_rate, 100);
    }

    #[test]
    fn test_reputation_tier_progression() {
        let env = Env::default();
        env.budget().reset_unlimited();

        initialize_reputation_system(&env);

        let address = Address::generate(&env);

        // Start at Bronze
        assert_eq!(get_tier(&env, address.clone()), ReputationTier::Bronze);

        // Complete tasks to reach Silver (100 points)
        for _ in 0..4 {
            update_reputation(&env, address.clone(), ReputationEvent::TaskCompleted, 5);
        }
        assert_eq!(get_tier(&env, address.clone()), ReputationTier::Silver);

        // Complete tasks to reach Gold (500 points)
        for _ in 0..17 {
            update_reputation(&env, address.clone(), ReputationEvent::TaskCompleted, 5);
        }
        assert_eq!(get_tier(&env, address.clone()), ReputationTier::Gold);
    }

    #[test]
    fn test_success_rate_calculation() {
        let env = Env::default();
        env.budget().reset_unlimited();

        initialize_reputation_system(&env);

        let address = Address::generate(&env);

        // Complete 9 tasks
        for _ in 0..9 {
            update_reputation(&env, address.clone(), ReputationEvent::TaskCompleted, 1);
        }

        // Fail 1 task
        update_reputation(&env, address.clone(), ReputationEvent::TaskFailed, 0);

        let profile = get_reputation(&env, address);
        assert_eq!(profile.tasks_completed, 9);
        assert_eq!(profile.tasks_failed, 1);
        assert_eq!(profile.success_rate, 90); // 9/10 = 90%
    }

    #[test]
    fn test_incentive_multipliers() {
        let env = Env::default();
        env.budget().reset_unlimited();

        initialize_reputation_system(&env);

        let address = Address::generate(&env);

        // Bronze: 1.0x
        assert_eq!(calculate_multiplier(&env, address.clone()), 100);

        // Reach Silver (100 points): 1.1x
        for _ in 0..4 {
            update_reputation(&env, address.clone(), ReputationEvent::TaskCompleted, 5);
        }
        assert_eq!(calculate_multiplier(&env, address.clone()), 110);

        // Reach Gold (500 points): 1.25x
        for _ in 0..17 {
            update_reputation(&env, address.clone(), ReputationEvent::TaskCompleted, 5);
        }
        assert_eq!(calculate_multiplier(&env, address.clone()), 125);
    }

    #[test]
    fn test_negative_reputation_bounded_at_zero() {
        let env = Env::default();
        env.budget().reset_unlimited();

        initialize_reputation_system(&env);

        let address = Address::generate(&env);

        // Start with 50 points
        for _ in 0..2 {
            update_reputation(&env, address.clone(), ReputationEvent::TaskCompleted, 5);
        }

        let profile = get_reputation(&env, address.clone());
        assert_eq!(profile.score, 50);

        // Fail tasks multiple times
        for _ in 0..10 {
            update_reputation(&env, address.clone(), ReputationEvent::TaskFailed, 0);
        }

        let profile = get_reputation(&env, address);
        assert_eq!(profile.score, 0); // Should not go below 0
    }
}
