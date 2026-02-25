#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env, Vec};

#[test]
fn test_initialize_profile() {
    let env = Env::default();
    let user = Address::generate(&env);

    let profile = initialize_profile(env.clone(), user.clone());

    assert_eq!(profile.address, user);
    assert_eq!(profile.score, 0);
    assert_eq!(profile.tier, ReputationTier::Bronze);
    assert_eq!(profile.tasks_completed, 0);
    assert_eq!(profile.success_rate, 10000);
    assert_eq!(profile.achievements.len(), 0);
    assert_eq!(profile.tasks_failed, 0);

    // Initializing again should return the same
    let profile2 = initialize_profile(env.clone(), user.clone());
    assert_eq!(profile, profile2);
}

#[test]
fn test_update_reputation_task_completed() {
    let env = Env::default();
    let user = Address::generate(&env);

    let score = update_reputation(
        env.clone(),
        user.clone(),
        ReputationEvent::TaskCompleted,
        20,
    );
    assert_eq!(score, 20);

    let tier = get_tier(env.clone(), user.clone());
    assert_eq!(tier, ReputationTier::Bronze);

    let profile = get_reputation(env.clone(), user.clone());
    assert_eq!(profile.tasks_completed, 1);
    assert_eq!(profile.success_rate, 10000);
}

#[test]
fn test_update_reputation_task_failed() {
    let env = Env::default();
    let user = Address::generate(&env);

    // First, complete a task to have > 0 score
    update_reputation(
        env.clone(),
        user.clone(),
        ReputationEvent::TaskCompleted,
        30,
    );
    let score = update_reputation(env.clone(), user.clone(), ReputationEvent::TaskFailed, 0);

    assert_eq!(score, 20); // 30 - 10

    let profile = get_reputation(env.clone(), user.clone());
    assert_eq!(profile.tasks_failed, 1);
    assert_eq!(profile.success_rate, 5000); // 1 success / 2 total = 50.00%
}

#[test]
fn test_decay() {
    let env = Env::default();
    let user = Address::generate(&env);

    update_reputation(
        env.clone(),
        user.clone(),
        ReputationEvent::TaskCompleted,
        100,
    );
    let mut profile = get_reputation(env.clone(), user.clone());
    assert_eq!(profile.score, 100);

    // Fast-forward time by 1 month (30 days)
    profile.last_active = profile.last_active.saturating_sub(30 * 24 * 60 * 60 + 1);
    storage::set_profile(&env, &user, &profile);

    // Trigger update to apply decay using dummy event
    let new_score = update_reputation(
        env.clone(),
        user.clone(),
        ReputationEvent::MilestoneAchieved,
        0,
    );

    // Score should decay by 1% of 100 = 1, so 99. But we added 0 for milestone, so it just decays.
    assert_eq!(new_score, 99);
}

#[test]
fn test_tiers_and_multipliers() {
    let env = Env::default();
    let user = Address::generate(&env);

    // Test Bronze
    assert_eq!(get_tier(env.clone(), user.clone()), ReputationTier::Bronze);
    assert_eq!(
        calculate_incentive_multiplier(env.clone(), user.clone()),
        100
    );

    // Test Silver
    update_reputation(
        env.clone(),
        user.clone(),
        ReputationEvent::MilestoneAchieved,
        100,
    );
    assert_eq!(get_tier(env.clone(), user.clone()), ReputationTier::Silver);
    assert_eq!(
        calculate_incentive_multiplier(env.clone(), user.clone()),
        110
    );

    // Test Gold
    update_reputation(
        env.clone(),
        user.clone(),
        ReputationEvent::MilestoneAchieved,
        400,
    );
    assert_eq!(get_tier(env.clone(), user.clone()), ReputationTier::Gold);
    assert_eq!(
        calculate_incentive_multiplier(env.clone(), user.clone()),
        125
    );

    // Test Platinum
    update_reputation(
        env.clone(),
        user.clone(),
        ReputationEvent::MilestoneAchieved,
        1000,
    );
    assert_eq!(
        get_tier(env.clone(), user.clone()),
        ReputationTier::Platinum
    );
    assert_eq!(
        calculate_incentive_multiplier(env.clone(), user.clone()),
        150
    );

    // Test Diamond
    update_reputation(
        env.clone(),
        user.clone(),
        ReputationEvent::MilestoneAchieved,
        3500,
    );
    assert_eq!(get_tier(env.clone(), user.clone()), ReputationTier::Diamond);
    assert_eq!(
        calculate_incentive_multiplier(env.clone(), user.clone()),
        200
    );
}

#[test]
fn test_achievements() {
    let env = Env::default();
    let user = Address::generate(&env);

    // Mock setting an achievement
    let ach = Achievement {
        id: 1,
        name: soroban_sdk::String::from_str(&env, "First Blood"),
        description: soroban_sdk::String::from_str(&env, "First task"),
        points: 50,
        criteria: soroban_sdk::String::from_str(&env, "tasks>=1"),
    };
    storage::set_achievement(&env, 1, &ach);

    // Make user eligible by mock data/criteria logic (assuming they have enough tasks)
    // Current criteria requires tasks_completed >= 10 for ID 1 based on achievements.rs
    for _ in 0..10 {
        update_reputation(env.clone(), user.clone(), ReputationEvent::TaskCompleted, 1);
    }

    assert_eq!(
        check_achievement_eligibility(env.clone(), user.clone(), 1),
        true
    );

    let success = award_achievement(env.clone(), user.clone(), 1);
    assert_eq!(success, true);

    let achs = get_achievements(env.clone(), user.clone());
    assert_eq!(achs.len(), 1);
    assert_eq!(achs.get(0).unwrap(), 1);

    // Score should include the 50 points
    let profile = get_reputation(env.clone(), user.clone());
    assert_eq!(profile.score, 60); // 10 tasks * 1 point + 50 points
}

#[test]
fn test_guild_contributors() {
    let env = Env::default();
    let user1 = Address::generate(&env);
    let user2 = Address::generate(&env);

    // Since we wired it primarily using simple global/event structures,
    // the top contributors expects the caller to update it or we directly do it.
    let mut current = Vec::new(&env);
    current.push_back(user1.clone());
    current.push_back(user2.clone());
    storage::set_guild_contributors(&env, 123, &current);

    let top = get_top_contributors(env.clone(), 123, 10);
    assert_eq!(top.len(), 2);
}
