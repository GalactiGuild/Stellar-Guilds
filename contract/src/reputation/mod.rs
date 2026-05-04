use soroban_sdk::{Env, String};

pub mod scoring;
pub mod storage;
pub mod types;

pub use scoring::{
    compute_governance_weight, get_decayed_profile, get_global_reputation, record_contribution,
};

pub use storage::{get_badges, get_contributions};

pub use types::{Badge, BadgeType, ContributionRecord, ContributionType, ReputationProfile};

pub fn get_reputation_base_uri(env: &Env) -> String {
    String::from_str(env, "ipfs://BASE_CID/")
}

pub fn token_uri(env: &Env, id: i128) -> String {
    match id {
        1 => String::from_str(env, "ipfs://BASE_CID/reputation_token_1.json"),
        2 => String::from_str(env, "ipfs://BASE_CID/reputation_token_2.json"),
        3 => String::from_str(env, "ipfs://BASE_CID/reputation_token_3.json"),
        _ => panic!("unsupported reputation token id"),
    }
}

pub fn get_token_metadata(env: &Env, id: u64) -> String {
    match id % 3 {
        0 => String::from_str(
            env,
            "{\"name\":\"Stellar Hero\",\"rank\":\"Master\",\"image\":\"ipfs://stellar-hero-master\"}",
        ),
        1 => String::from_str(
            env,
            "{\"name\":\"Stellar Hero\",\"rank\":\"Captain\",\"image\":\"ipfs://stellar-hero-captain\"}",
        ),
        _ => String::from_str(
            env,
            "{\"name\":\"Stellar Hero\",\"rank\":\"Scout\",\"image\":\"ipfs://stellar-hero-scout\"}",
        ),
    }
}

#[cfg(test)]
mod tests;
