/// Core types for the Contract Integration Layer.
///
/// This module defines the fundamental data structures for cross-contract
/// communication, registry management, and event coordination.

use soroban_sdk::{contracttype, Address, String, Symbol, Vec};

/// Contract type enumeration for all platform contracts.
#[contracttype]
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum ContractType {
    Guild,
    Bounty,
    Payment,
    Milestone,
    Dispute,
    Reputation,
    Treasury,
    Subscription,
    Governance,
    Analytics,
    Allowance,
    Multisig,
    Emergency,
    Upgrade,
    Proxy,
}

/// Contract version tracking structure.
#[contracttype]
#[derive(Clone, Debug)]
pub struct ContractVersion {
    pub contract_type: ContractType,
    pub version: u32,
    pub address: Address,
    pub deployed_at: u64,
}

/// Unified event structure for cross-contract event tracking.
#[contracttype]
#[derive(Clone, Debug)]
pub struct Event {
    pub event_type: EventType,
    pub contract_source: ContractType,
    pub timestamp: u64,
    pub data: Symbol,
    pub event_id: u128,
}

/// Comprehensive event type enumeration for all platform events.
#[contracttype]
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum EventType {
    // Guild events
    GuildCreated,
    GuildMemberAdded,
    GuildMemberRemoved,
    GuildRoleUpdated,
    
    // Bounty events
    BountyCreated,
    BountyFunded,
    BountyClaimed,
    BountyCompleted,
    BountyCancelled,
    
    // Payment events
    PaymentDistributed,
    PaymentPoolCreated,
    PaymentRecipientAdded,
    
    // Milestone events
    MilestoneCreated,
    MilestoneStarted,
    MilestoneSubmitted,
    MilestoneApproved,
    MilestonePaymentReleased,
    
    // Dispute events
    DisputeCreated,
    DisputeVoteCast,
    DisputeResolved,
    
    // Reputation events
    ReputationUpdated,
    ReputationAchievementAwarded,
    ReputationTierChanged,
    
    // Treasury events
    TreasuryDeposited,
    TreasuryWithdrawalProposed,
    TreasuryTransactionExecuted,
    
    // Subscription events
    SubscriptionCreated,
    SubscriptionPaymentExecuted,
    SubscriptionCancelled,
    
    // Governance events
    GovernanceProposalCreated,
    GovernanceVoted,
    GovernanceProposalExecuted,
    
    // Allowance events
    AllowanceGranted,
    AllowanceRevoked,
    AllowanceIncreased,
    AllowanceDecreased,
    
    // Multisig events
    MultisigAccountCreated,
    MultisigOperationProposed,
    MultisigOperationSigned,
    MultisigOperationExecuted,
    
    // Emergency events
    EmergencyPaused,
    EmergencyResumed,
    
    // Upgrade events
    UpgradeProposed,
    UpgradeExecuted,
    EmergencyUpgrade,
}

/// Event subscription record.
#[contracttype]
#[derive(Clone, Debug)]
pub struct EventSubscription {
    pub subscriber: Address,
    pub event_types: Vec<EventType>,
    pub subscribed_at: u64,
}

/// Event filter for querying events.
#[contracttype]
#[derive(Clone, Debug)]
pub struct EventFilter {
    pub event_type: Option<EventType>,
    pub contract_source: Option<ContractType>,
    pub from_timestamp: u64,
    pub to_timestamp: u64,
}

/// Contract registry entry.
#[contracttype]
#[derive(Clone, Debug)]
pub struct ContractRegistryEntry {
    pub contract_type: ContractType,
    pub address: Address,
    pub version: u32,
    pub deployed_at: u64,
    pub is_active: bool,
}

/// Cross-contract call result.
#[contracttype]
#[derive(Clone, Debug)]
pub enum CrossContractResult<T> {
    Success(T),
    Failure(Symbol),
}

/// Error codes for the integration layer.
#[contracttype]
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum IntegrationError {
    ContractNotRegistered,
    InvalidAddress,
    Unauthorized,
    EventStorageFull,
    InvalidEventData,
    CircularDependency,
    VersionIncompatible,
    CallFailed,
    RegistryCorrupted,
    InvalidContractType,
    DuplicateRegistration,
    EventNotFound,
    SubscriptionNotFound,
    InvalidFilter,
    DataTooLarge,
    InvalidParameter,
}

/// Result type alias for integration operations.
pub type IntegrationResult<T> = Result<T, IntegrationError>;

/// Maximum event data size in bytes.
pub const MAX_EVENT_DATA_SIZE: usize = 1024;

/// Default event storage limit.
pub const DEFAULT_EVENT_LIMIT: u32 = 100;

/// Integration layer status information.
#[contracttype]
#[derive(Clone, Debug)]
pub struct IntegrationStatus {
    pub contract_count: u32,
    pub event_count: u64,
    pub is_initialized: bool,
}
