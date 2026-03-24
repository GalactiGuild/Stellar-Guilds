/// Bounty Contract Interface.

use soroban_sdk::{contracttype, Address, Env, String};

/// Bounty status enumeration.
#[contracttype]
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum BountyStatus {
    Open,
    Funded,
    Claimed,
    Completed,
    Cancelled,
    Expired,
}

/// Bounty information.
#[contracttype]
#[derive(Clone, Debug)]
pub struct BountyInfo {
    pub id: u64,
    pub guild_id: u64,
    pub creator: Address,
    pub title: String,
    pub description: String,
    pub reward_amount: i128,
    pub status: BountyStatus,
    pub created_at: u64,
    pub expiry: u64,
}
