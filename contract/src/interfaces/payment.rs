/// Payment Contract Interface.

use soroban_sdk::{contracttype, Address, Env};

#[contracttype]
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum DistributionRule {
    Percentage,
    EqualSplit,
    Custom,
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct PaymentPool {
    pub id: u64,
    pub total_amount: i128,
    pub rule: DistributionRule,
    pub creator: Address,
}
