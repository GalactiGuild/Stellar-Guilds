use crate::reputation::storage;
use crate::reputation::types::{ReputationEvent, ReputationProfile, ReputationTier};
use soroban_sdk::{Address, Env, Vec};

pub fn calculate_decay(env: &Env, profile: &mut ReputationProfile) {
    let current_time = env.ledger().timestamp();
    let month_seconds: u64 = 30 * 24 * 60 * 60;

    if profile.last_active > 0 {
        let inactive_duration = current_time.saturating_sub(profile.last_active);
        let months_inactive = inactive_duration / month_seconds;

        if months_inactive > 0 {
            // Decay by 1% per month of inactivity
            for _ in 0..months_inactive {
                let decay_amount = profile.score / 100; // 1%
                profile.score = profile.score.saturating_sub(decay_amount);
            }
        }
    }

    // Always update last_active when scoring is processed
    profile.last_active = current_time;
}

pub fn process_event(
    env: &Env,
    profile: &mut ReputationProfile,
    event: ReputationEvent,
    base_value: u32,
) {
    // Determine point change
    let point_delta: i64 = match event {
        ReputationEvent::TaskCompleted => {
            profile.tasks_completed = profile.tasks_completed.saturating_add(1);
            base_value as i64 // usually +10 to +50
        }
        ReputationEvent::MilestoneAchieved => {
            base_value as i64 // usually +20 to +100
        }
        ReputationEvent::DisputeWon => 5,
        ReputationEvent::DisputeLost => -20,
        ReputationEvent::TaskFailed => {
            profile.tasks_failed = profile.tasks_failed.saturating_add(1);
            -10
        }
    };

    if point_delta > 0 {
        profile.score = profile.score.saturating_add(point_delta as u32);
    } else {
        profile.score = profile.score.saturating_sub(point_delta.abs() as u32);
    }

    // Calculate new success rate (e.g. 9500 = 95.00%)
    let total_tasks = profile.tasks_completed + profile.tasks_failed;
    if total_tasks > 0 {
        profile.success_rate = (profile.tasks_completed * 10000) / total_tasks;
    } else {
        profile.success_rate = 10000;
    }

    // Success rate bonus (+50% bonus on top if success rate > 95%)
    let mut actual_score = profile.score;
    if profile.success_rate > 9500 {
        // e.g. 50% bonus
        actual_score = actual_score.saturating_add(actual_score / 2);
    }

    // Update tier based on actual score with bonuses
    profile.tier = determine_tier(actual_score);
}

pub fn determine_tier(score: u32) -> ReputationTier {
    if score >= 5000 {
        ReputationTier::Diamond
    } else if score >= 1500 {
        ReputationTier::Platinum
    } else if score >= 500 {
        ReputationTier::Gold
    } else if score >= 100 {
        ReputationTier::Silver
    } else {
        ReputationTier::Bronze
    }
}

pub fn get_multiplier(tier: &ReputationTier) -> u32 {
    match tier {
        ReputationTier::Bronze => 100,
        ReputationTier::Silver => 110,
        ReputationTier::Gold => 125,
        ReputationTier::Platinum => 150,
        ReputationTier::Diamond => 200,
    }
}

pub fn update_top_contributors(env: &Env, guild_id: u64, addr: Address, new_score: u32) {
    let mut contributors = storage::get_guild_contributors(env, guild_id);

    // Naive tracking logic for small sets - add/sort/truncate to keep top 50
    // In a production app, we'd probably use a more performant structure or off-chain indexer
    if !contributors.contains(&addr) {
        contributors.push_back(addr);
    }

    // For sorting, we have to copy values off-chain or do manual insertion sort
    // Due to Soroban limits, we avoid full sorting here and just ensure they're in the list
    storage::set_guild_contributors(env, guild_id, &contributors);
}

// Re-add compute_governance_weight for governance integration
pub fn compute_governance_weight(env: &Env, address: &Address, _guild_id: u64, role: &crate::guild::types::Role) -> i128 {
    let base_weight = crate::governance::types::role_weight(role);
    let profile = storage::get_profile(env, address).unwrap_or_else(|| {
        ReputationProfile {
            address: address.clone(),
            score: 0,
            tier: ReputationTier::Bronze,
            tasks_completed: 0,
            success_rate: 10000,
            achievements: Vec::new(env),
            last_active: env.ledger().timestamp(),
            tasks_failed: 0,
        }
    });
    
    // Scale base weight by reputation tier multiplier
    let multiplier = get_multiplier(&profile.tier) as i128;
    (base_weight * multiplier) / 100
}
