use crate::reputation::types::{Achievement, ReputationProfile};
use soroban_sdk::{contracttype, Address, Env, Vec};

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Profile(Address),
    Achievement(u64),
    GuildContributors(u64), // stores a Vec<Address> of top contributors or all contributors
}

pub fn get_profile(env: &Env, addr: &Address) -> Option<ReputationProfile> {
    env.storage()
        .persistent()
        .get(&DataKey::Profile(addr.clone()))
}

pub fn set_profile(env: &Env, addr: &Address, profile: &ReputationProfile) {
    env.storage()
        .persistent()
        .set(&DataKey::Profile(addr.clone()), profile);
}

pub fn get_achievement(env: &Env, id: u64) -> Option<Achievement> {
    env.storage().persistent().get(&DataKey::Achievement(id))
}

pub fn set_achievement(env: &Env, id: u64, achievement: &Achievement) {
    env.storage()
        .persistent()
        .set(&DataKey::Achievement(id), achievement);
}

pub fn get_guild_contributors(env: &Env, guild_id: u64) -> Vec<Address> {
    env.storage()
        .persistent()
        .get(&DataKey::GuildContributors(guild_id))
        .unwrap_or(Vec::new(env))
}

pub fn set_guild_contributors(env: &Env, guild_id: u64, contributors: &Vec<Address>) {
    env.storage()
        .persistent()
        .set(&DataKey::GuildContributors(guild_id), contributors);
}
