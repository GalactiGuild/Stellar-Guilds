use crate::reputation::storage;
use crate::reputation::types::{Achievement, ReputationProfile};
use soroban_sdk::{Address, Env, String, Vec};

pub fn check_eligibility(env: &Env, profile: &ReputationProfile, achievement_id: u64) -> bool {
    let achievement = storage::get_achievement(env, achievement_id);
    if achievement.is_none() {
        return false;
    }

    // Prevent awarding same achievement multiple times
    if profile.achievements.contains(&achievement_id) {
        return false;
    }

    // Basic eligibility check based on criteria
    // In a full implementation, you'd parse `criteria` (e.g., "tasks>=10")
    // For this example, we assume eligibility is verified off-chain and explicitly awarded
    // or we check simple static criteria here based on ID rules.
    match achievement_id {
        1 => profile.tasks_completed >= 10, // "Bronze Worker"
        2 => profile.tasks_completed >= 50, // "Silver Worker"
        3 => profile.score >= 1000,         // "Reputable"
        _ => true,                          // Assume true for custom/manual awards if not standard
    }
}

pub fn award(env: &Env, profile: &mut ReputationProfile, achievement_id: u64) -> bool {
    if !check_eligibility(env, profile, achievement_id) {
        return false;
    }

    if let Some(achievement) = storage::get_achievement(env, achievement_id) {
        profile.achievements.push_back(achievement_id);
        profile.score = profile.score.saturating_add(achievement.points);
        return true;
    }
    false
}
