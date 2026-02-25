use soroban_sdk::{contracttype, Address, String};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum ReputationTier {
    Bronze,
    Silver,
    Gold,
    Platinum,
    Diamond,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ReputationProfile {
    pub address: Address,
    pub score: u32,
    pub tier: ReputationTier,
    pub tasks_completed: u32,
    pub success_rate: u32, // multiplied by 100, e.g., 9500 = 95.00%
    // Only keeping recent/major ones if needed, or simply storing achievement IDs
    pub achievements: soroban_sdk::Vec<u64>,
    pub last_active: u64, // timestamp
    pub tasks_failed: u32,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Achievement {
    pub id: u64,
    pub name: String,
    pub description: String,
    pub points: u32,
    pub criteria: String,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum ReputationEvent {
    TaskCompleted,
    TaskFailed,
    DisputeWon,
    DisputeLost,
    MilestoneAchieved,
}
