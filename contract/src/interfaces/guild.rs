/// Guild Contract Interface.

use soroban_sdk::{contracttype, Address, Env, String, Symbol};

/// Role enumeration for guild members.
#[contracttype]
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum GuildRole {
    Owner,
    Admin,
    Member,
    Contributor,
}

/// Guild member information.
#[contracttype]
#[derive(Clone, Debug)]
pub struct GuildMember {
    pub address: Address,
    pub role: GuildRole,
    pub joined_at: u64,
}

/// Guild information.
#[contracttype]
#[derive(Clone, Debug)]
pub struct GuildInfo {
    pub id: u64,
    pub name: String,
    pub description: String,
    pub owner: Address,
    pub created_at: u64,
}
