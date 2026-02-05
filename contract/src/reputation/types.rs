use soroban_sdk::{contracttype, Address, String, Vec};

/// Reputation tier levels determining contributor status and benefits
#[contracttype]
#[derive(Clone, Copy, Debug, PartialEq, Eq, PartialOrd, Ord)]
pub enum ReputationTier {
    Bronze = 0,   // 0-99 points
    Silver = 1,   // 100-499 points
    Gold = 2,     // 500-1499 points
    Platinum = 3, // 1500-4999 points
    Diamond = 4,  // 5000+ points
}

/// Events that trigger reputation changes
#[contracttype]
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum ReputationEvent {
    /// Task completed successfully
    TaskCompleted,
    /// Milestone reached
    MilestoneAchieved,
    /// Won a dispute
    DisputeWon,
    /// Lost a dispute
    DisputeLost,
    /// Task failed or cancelled
    TaskFailed,
    /// Time decay applied
    TimeDecay,
    /// Success rate bonus applied
    SuccessRateBonus,
}

/// Achievement/badge definition
#[contracttype]
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Achievement {
    /// Unique achievement identifier
    pub id: u64,
    /// Achievement name
    pub name: String,
    /// Detailed description
    pub description: String,
    /// Reputation points awarded
    pub points: u32,
    /// Criteria for earning (e.g., "Complete 10 tasks")
    pub criteria: String,
    /// Minimum tasks required
    pub min_tasks: u32,
    /// Minimum success rate (0-100)
    pub min_success_rate: u32,
}

/// Contributor reputation profile with full tracking
#[contracttype]
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct ReputationProfile {
    /// Contributor address
    pub address: Address,
    /// Current reputation score
    pub score: u32,
    /// Current reputation tier
    pub tier: ReputationTier,
    /// Total tasks completed
    pub tasks_completed: u32,
    /// Total tasks failed
    pub tasks_failed: u32,
    /// Success rate (0-100)
    pub success_rate: u32,
    /// Achievements earned (by achievement ID)
    pub achievements: Vec<u64>,
    /// Last activity timestamp (for decay calculation)
    pub last_activity: u64,
    /// Creation timestamp
    pub created_at: u64,
    /// Disputes won
    pub disputes_won: u32,
    /// Disputes lost
    pub disputes_lost: u32,
    /// Milestones completed
    pub milestones_completed: u32,
}

// ============ Events ============

/// Event emitted when a reputation profile is initialized
#[contracttype]
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct ProfileInitializedEvent {
    pub address: Address,
    pub initial_score: u32,
    pub tier: ReputationTier,
    pub timestamp: u64,
}

/// Event emitted when reputation score changes
#[contracttype]
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct ReputationUpdatedEvent {
    pub address: Address,
    pub event_type: ReputationEvent,
    pub old_score: u32,
    pub new_score: u32,
    pub old_tier: ReputationTier,
    pub new_tier: ReputationTier,
    pub timestamp: u64,
}

/// Event emitted when achievement is awarded
#[contracttype]
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct AchievementAwardedEvent {
    pub address: Address,
    pub achievement_id: u64,
    pub achievement_name: String,
    pub points_awarded: u32,
    pub timestamp: u64,
}

/// Event emitted when reputation tier changes
#[contracttype]
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct TierUpgradedEvent {
    pub address: Address,
    pub old_tier: ReputationTier,
    pub new_tier: ReputationTier,
    pub current_score: u32,
    pub timestamp: u64,
}
