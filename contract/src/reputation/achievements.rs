use soroban_sdk::{Env, String, Vec};

use super::storage::{get_achievement, get_all_achievements, get_next_achievement_id, set_achievement};
use super::types::{Achievement, ReputationProfile};

// ============ Achievement Management ============

/// Create a new achievement definition
pub fn create_achievement(
    env: &Env,
    name: String,
    description: String,
    points: u32,
    criteria: String,
    min_tasks: u32,
    min_success_rate: u32,
) -> u64 {
    let achievement_id = get_next_achievement_id(env);

    let achievement = Achievement {
        id: achievement_id,
        name,
        description,
        points,
        criteria,
        min_tasks,
        min_success_rate,
    };

    set_achievement(env, &achievement);

    achievement_id
}

/// Check if a contributor is eligible for a specific achievement
pub fn check_eligibility(
    env: &Env,
    profile: &ReputationProfile,
    achievement_id: u64,
) -> bool {
    // Check if already awarded
    if has_achievement(profile, achievement_id) {
        return false;
    }

    // Get achievement definition
    let achievement = match get_achievement(env, achievement_id) {
        Some(ach) => ach,
        None => return false,
    };

    // Check criteria
    let meets_task_requirement = profile.tasks_completed >= achievement.min_tasks;
    let meets_success_rate = profile.success_rate >= achievement.min_success_rate;

    meets_task_requirement && meets_success_rate
}

/// Check if profile already has an achievement
pub fn has_achievement(profile: &ReputationProfile, achievement_id: u64) -> bool {
    for i in 0..profile.achievements.len() {
        if let Some(id) = profile.achievements.get(i) {
            if id == achievement_id {
                return true;
            }
        }
    }
    false
}

/// Get all achievements earned by a contributor
pub fn get_contributor_achievements(
    env: &Env,
    profile: &ReputationProfile,
) -> Vec<Achievement> {
    let mut achievements = Vec::new(env);

    for i in 0..profile.achievements.len() {
        if let Some(achievement_id) = profile.achievements.get(i) {
            if let Some(achievement) = get_achievement(env, achievement_id) {
                achievements.push_back(achievement);
            }
        }
    }

    achievements
}

/// Get all eligible achievements for a contributor
pub fn get_eligible_achievements(
    env: &Env,
    profile: &ReputationProfile,
) -> Vec<Achievement> {
    let all_achievements = get_all_achievements(env);
    let mut eligible = Vec::new(env);

    for i in 0..all_achievements.len() {
        if let Some(achievement) = all_achievements.get(i) {
            if check_eligibility(env, profile, achievement.id) {
                eligible.push_back(achievement);
            }
        }
    }

    eligible
}

/// Initialize default achievements
pub fn initialize_default_achievements(env: &Env) {
    // First Task Achievement
    create_achievement(
        env,
        String::from_str(env, "First Steps"),
        String::from_str(env, "Complete your first task"),
        10,
        String::from_str(env, "Complete 1 task"),
        1,
        0,
    );

    // Task Veteran
    create_achievement(
        env,
        String::from_str(env, "Task Veteran"),
        String::from_str(env, "Complete 10 tasks"),
        50,
        String::from_str(env, "Complete 10 tasks"),
        10,
        0,
    );

    // Task Master
    create_achievement(
        env,
        String::from_str(env, "Task Master"),
        String::from_str(env, "Complete 50 tasks"),
        200,
        String::from_str(env, "Complete 50 tasks"),
        50,
        0,
    );

    // Perfect Record
    create_achievement(
        env,
        String::from_str(env, "Perfect Record"),
        String::from_str(env, "Maintain 100% success rate with 10+ tasks"),
        100,
        String::from_str(env, "Complete 10 tasks with 100% success rate"),
        10,
        100,
    );

    // Reliable Contributor
    create_achievement(
        env,
        String::from_str(env, "Reliable Contributor"),
        String::from_str(env, "Maintain 95%+ success rate with 20+ tasks"),
        150,
        String::from_str(env, "Complete 20 tasks with 95%+ success rate"),
        20,
        95,
    );

    // Century Club
    create_achievement(
        env,
        String::from_str(env, "Century Club"),
        String::from_str(env, "Complete 100 tasks"),
        500,
        String::from_str(env, "Complete 100 tasks"),
        100,
        0,
    );

    // Dispute Resolver
    create_achievement(
        env,
        String::from_str(env, "Dispute Resolver"),
        String::from_str(env, "Win 5 disputes"),
        75,
        String::from_str(env, "Win 5 disputes with 80%+ success"),
        5,
        80,
    );

    // Elite Contributor
    create_achievement(
        env,
        String::from_str(env, "Elite Contributor"),
        String::from_str(env, "Reach Diamond tier"),
        1000,
        String::from_str(env, "Reach 5000+ reputation points"),
        50,
        90,
    );
}

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Address, Env};
    use crate::reputation::types::ReputationTier;

    #[test]
    fn test_has_achievement() {
        let env = Env::default();
        let address = Address::generate(&env);

        let mut achievements = Vec::new(&env);
        achievements.push_back(1u64);
        achievements.push_back(5u64);
        achievements.push_back(10u64);

        let profile = ReputationProfile {
            address: address.clone(),
            score: 100,
            tier: ReputationTier::Silver,
            tasks_completed: 10,
            tasks_failed: 0,
            success_rate: 100,
            achievements,
            last_activity: 0,
            created_at: 0,
            disputes_won: 0,
            disputes_lost: 0,
            milestones_completed: 0,
        };

        assert_eq!(has_achievement(&profile, 1), true);
        assert_eq!(has_achievement(&profile, 5), true);
        assert_eq!(has_achievement(&profile, 10), true);
        assert_eq!(has_achievement(&profile, 2), false);
        assert_eq!(has_achievement(&profile, 99), false);
    }
}
