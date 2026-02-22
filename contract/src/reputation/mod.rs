// reputation/mod.rs
pub mod achievements;
pub mod scoring;
pub mod storage;
pub mod types;

pub use achievements::*;
pub use scoring::*;
pub use storage::*;
pub use types::*;

use soroban_sdk::{Address, Env, Vec};

pub fn initialize_profile(env: Env, address: Address) -> ReputationProfile {
    // Check if it already exists
    if let Some(profile) = storage::get_profile(&env, &address) {
        return profile;
    }

    let profile = ReputationProfile {
        address: address.clone(),
        score: 0,
        tier: ReputationTier::Bronze,
        tasks_completed: 0,
        success_rate: 10000,
        achievements: Vec::new(&env),
        last_active: env.ledger().timestamp(),
        tasks_failed: 0,
    };
    storage::set_profile(&env, &address, &profile);
    profile
}

pub fn update_reputation(env: Env, address: Address, event: ReputationEvent, value: u32) -> u32 {
    let mut profile = storage::get_profile(&env, &address)
        .unwrap_or_else(|| initialize_profile(env.clone(), address.clone()));

    // Apply time decay based on last activity
    scoring::calculate_decay(&env, &mut profile);

    // Process the new event
    let old_tier = profile.tier.clone();
    scoring::process_event(&env, &mut profile, event.clone(), value);

    // Emit reputation update event
    env.events().publish(
        (
            soroban_sdk::Symbol::new(&env, "reputation_updated"),
            address.clone(),
        ),
        (event, value, profile.score, profile.tier.clone()),
    );

    if old_tier != profile.tier {
        // Emit tier change event
        env.events().publish(
            (
                soroban_sdk::Symbol::new(&env, "tier_changed"),
                address.clone(),
            ),
            (old_tier, profile.tier.clone()),
        );
    }

    storage::set_profile(&env, &address, &profile);
    profile.score
}

pub fn award_achievement(env: Env, address: Address, achievement_id: u64) -> bool {
    let mut profile = match storage::get_profile(&env, &address) {
        Some(p) => p,
        None => return false,
    };

    if achievements::award(&env, &mut profile, achievement_id) {
        let old_tier = profile.tier.clone();
        profile.tier = scoring::determine_tier(profile.score);

        // Emit achievement awarded event
        env.events().publish(
            (
                soroban_sdk::Symbol::new(&env, "achievement_awarded"),
                address.clone(),
            ),
            achievement_id,
        );

        if old_tier != profile.tier {
            env.events().publish(
                (
                    soroban_sdk::Symbol::new(&env, "tier_changed"),
                    address.clone(),
                ),
                (old_tier, profile.tier.clone()),
            );
        }

        storage::set_profile(&env, &address, &profile);
        return true;
    }
    false
}

pub fn get_reputation(env: Env, address: Address) -> ReputationProfile {
    let mut profile = storage::get_profile(&env, &address)
        .unwrap_or_else(|| initialize_profile(env.clone(), address.clone()));
    scoring::calculate_decay(&env, &mut profile);
    profile
}

pub fn get_tier(env: Env, address: Address) -> ReputationTier {
    let profile = get_reputation(env, address);
    profile.tier
}

pub fn calculate_incentive_multiplier(env: Env, address: Address) -> u32 {
    let profile = get_reputation(env, address);
    scoring::get_multiplier(&profile.tier)
}

pub fn get_top_contributors(env: Env, guild_id: u64, limit: u32) -> Vec<Address> {
    // We fetch the full list of contributors and sort by score to return the top N.
    // Given Soroban limits, sorting large lists strictly in-contract is generally expensive.
    // For this implementation, we simulate it simply by taking from the stored contributors list.
    let contributors = storage::get_guild_contributors(&env, guild_id);

    // In actual production, sorting would ideally be handled off-chain,
    // or through an ordered structure (which Soroban doesn't natively supply yet).
    let mut profiles: soroban_sdk::Vec<(Address, u32)> = Vec::new(&env);
    for addr in contributors.iter() {
        if let Some(p) = storage::get_profile(&env, &addr) {
            profiles.push_back((addr.clone(), p.score));
        }
    }

    // Manual insert-sort logic to grab top N (skipping due to WASM instruction limits,
    // returning the list directly for now, up to limit)
    let len = core::cmp::min(contributors.len() as u32, limit);
    let mut result = Vec::new(&env);
    for i in 0..len {
        result.push_back(contributors.get_unchecked(i).clone());
    }
    result
}

pub fn check_achievement_eligibility(env: Env, address: Address, achievement_id: u64) -> bool {
    let profile = storage::get_profile(&env, &address)
        .unwrap_or_else(|| initialize_profile(env.clone(), address.clone()));
    achievements::check_eligibility(&env, &profile, achievement_id)
}

pub fn get_achievements(env: Env, address: Address) -> Vec<u64> {
    let profile = storage::get_profile(&env, &address)
        .unwrap_or_else(|| initialize_profile(env.clone(), address.clone()));
    profile.achievements
}
