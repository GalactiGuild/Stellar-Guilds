/// Treasury Contract Interface.

use soroban_sdk::{contracttype, Address, Env};

#[contracttype]
#[derive(Clone, Debug)]
pub struct TreasuryInfo {
    pub id: u64,
    pub guild_id: u64,
    pub balance_xlm: i128,
    pub total_deposits: i128,
    pub total_withdrawals: i128,
}
