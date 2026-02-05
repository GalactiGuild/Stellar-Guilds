use soroban_sdk::{symbol_short, Address, Env, Map, Vec};

use super::types::{Achievement, ReputationProfile};

// ============ Storage Keys ============

/// Key for reputation profile counter (generates new profile IDs)
const PROFILE_COUNTER: &str = "REP_CNT";

/// Key prefix for reputation profiles (maps Address -> ReputationProfile)
const PROFILE_PREFIX: &str = "REP_PROF";

/// Key for achievement counter (generates new achievement IDs)
const ACHIEVEMENT_COUNTER: &str = "ACH_CNT";

/// Key prefix for achievements (maps achievement_id -> Achievement)
const ACHIEVEMENT_PREFIX: &str = "ACH";

/// Key for guild leaderboard (maps guild_id -> Vec<Address>)
const GUILD_LEADERBOARD_PREFIX: &str = "LEAD";

// ============ Storage Functions ============

/// Initialize storage counters
pub fn initialize_reputation_storage(env: &Env) {
    env.storage()
        .instance()
        .set(&symbol_short!("REP_CNT"), &0u64);
    env.storage()
        .instance()
        .set(&symbol_short!("ACH_CNT"), &0u64);
}

/// Get or create reputation profile for an address
pub fn get_profile(env: &Env, address: &Address) -> Option<ReputationProfile> {
    let key = (symbol_short!("REP_PROF"), address.clone());
    env.storage().persistent().get(&key)
}

/// Save reputation profile
pub fn set_profile(env: &Env, profile: &ReputationProfile) {
    let key = (symbol_short!("REP_PROF"), profile.address.clone());
    env.storage().persistent().set(&key, profile);
}

/// Check if profile exists
pub fn has_profile(env: &Env, address: &Address) -> bool {
    let key = (symbol_short!("REP_PROF"), address.clone());
    env.storage().persistent().has(&key)
}

/// Get achievement by ID
pub fn get_achievement(env: &Env, achievement_id: u64) -> Option<Achievement> {
    let key = (symbol_short!("ACH"), achievement_id);
    env.storage().persistent().get(&key)
}

/// Save achievement
pub fn set_achievement(env: &Env, achievement: &Achievement) {
    let key = (symbol_short!("ACH"), achievement.id);
    env.storage().persistent().set(&key, achievement);
}

/// Get next achievement ID and increment counter
pub fn get_next_achievement_id(env: &Env) -> u64 {
    let current: u64 = env
        .storage()
        .instance()
        .get(&symbol_short!("ACH_CNT"))
        .unwrap_or(0);
    let next = current + 1;
    env.storage()
        .instance()
        .set(&symbol_short!("ACH_CNT"), &next);
    next
}

/// Get all achievements
pub fn get_all_achievements(env: &Env) -> Vec<Achievement> {
    let count: u64 = env
        .storage()
        .instance()
        .get(&symbol_short!("ACH_CNT"))
        .unwrap_or(0);

    let mut achievements = Vec::new(env);
    for id in 1..=count {
        if let Some(achievement) = get_achievement(env, id) {
            achievements.push_back(achievement);
        }
    }
    achievements
}

/// Add address to guild leaderboard (sorted by score)
pub fn update_leaderboard(env: &Env, guild_id: u64, address: &Address, score: u32) {
    let key = (symbol_short!("LEAD"), guild_id);

    // Get existing leaderboard or create new
    let mut leaderboard: Map<Address, u32> = env
        .storage()
        .persistent()
        .get(&key)
        .unwrap_or(Map::new(env));

    // Update score for this address
    leaderboard.set(address.clone(), score);

    // Save updated leaderboard
    env.storage().persistent().set(&key, &leaderboard);
}

/// Get top contributors for a guild
pub fn get_top_contributors(env: &Env, guild_id: u64, limit: u32) -> Vec<Address> {
    let key = (symbol_short!("LEAD"), guild_id);

    let leaderboard: Map<Address, u32> = env
        .storage()
        .persistent()
        .get(&key)
        .unwrap_or(Map::new(env));

    // Convert to vec for sorting
    let mut entries: Vec<(Address, u32)> = Vec::new(env);
    let keys = leaderboard.keys();

    for i in 0..keys.len() {
        let addr = keys.get(i).unwrap();
        let score = leaderboard.get(addr.clone()).unwrap();
        entries.push_back((addr, score));
    }

    // Sort by score (descending) - bubble sort for simplicity
    let len = entries.len();
    for i in 0..len {
        for j in 0..(len - i - 1) {
            let curr = entries.get(j).unwrap();
            let next = entries.get(j + 1).unwrap();
            if curr.1 < next.1 {
                // Swap
                let temp = curr.clone();
                entries.set(j, next);
                entries.set(j + 1, temp);
            }
        }
    }

    // Return top N addresses
    let mut result = Vec::new(env);
    let max_results = if limit < entries.len() { limit } else { entries.len() };

    for i in 0..max_results {
        let entry = entries.get(i).unwrap();
        result.push_back(entry.0);
    }

    result
}
