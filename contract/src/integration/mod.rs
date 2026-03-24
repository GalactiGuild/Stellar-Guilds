/// Contract Integration Layer Module.
///
/// This module provides the core infrastructure for cross-contract communication
/// within the Stellar Guilds platform. It enables seamless interaction between
/// different contract modules while maintaining security and consistency.
///
/// # Architecture
///
/// The integration layer consists of four main components:
///
/// 1. **Registry** (`registry.rs`) - Centralized contract address management
/// 2. **Events** (`events.rs`) - Unified event emission and retrieval system
/// 3. **Authorization** (`auth.rs`) - Cross-contract permission framework
/// 4. **Types** (`types.rs`) - Shared data structures and enums
///
/// # Usage
///
/// ```rust
/// use crate::integration::{
///     registry, events, auth,
///     types::{ContractType, EventType},
/// };
///
/// // Register a contract
/// registry::register_contract(&env, &admin, ContractType::Bounty, address, version)?;
///
/// // Emit an event
/// events::emit_event(&env, EventType::BountyCreated, ContractType::Bounty, data)?;
///
/// // Verify cross-contract auth
/// auth::verify_cross_contract_auth(&env, &caller, ContractType::Treasury, PermissionLevel::Write)?;
/// ```
///
/// # Security Considerations
///
/// - Only admin addresses can register or update contracts
/// - Cross-contract calls require explicit authorization
/// - Event data is immutable once emitted
/// - Contract addresses are validated before registration
///
/// # Performance Notes
///
/// - Event storage has a limit of 10,000 events (configurable)
/// - Registry lookups are O(1) using Map data structure
/// - Event filtering supports pagination for large datasets

pub mod types;
pub mod registry;
pub mod events;
pub mod auth;
pub mod utils;
pub mod status;

// Re-export commonly used items for convenience
pub use types::{
    ContractType, EventType, Event, ContractVersion, ContractRegistryEntry,
    IntegrationError, IntegrationResult, EventFilter, EventSubscription,
    CrossContractResult, MAX_EVENT_DATA_SIZE, DEFAULT_EVENT_LIMIT,
};

pub use registry::{
    register_contract, get_contract_address, update_contract, get_all_contracts,
    get_contract_version, deactivate_contract,
};

pub use events::{
    emit_event, get_events, subscribe_to_events, unsubscribe_from_events,
    get_event_by_id, get_subscription, get_event_count, create_event_id,
};

pub use auth::{
    verify_cross_contract_auth, PermissionLevel, AuthContext,
    call_guild_contract, call_bounty_contract, set_integration_admin,
    grant_cross_contract_access, revoke_cross_contract_access,
};

pub use utils::{validate_address, format_error};
pub use types::IntegrationStatus;
pub use status::get_integration_status;

/// Initialize the integration layer.
///
/// # Arguments
/// * `env` - The Soroban environment
/// * `admin` - Admin address for registry and authorization
///
/// # Returns
/// `true` if initialization was successful
pub fn initialize(env: &soroban_sdk::Env, admin: soroban_sdk::Address) -> bool {
    registry::initialize(env, admin.clone());
    auth::set_integration_admin(env, &admin.clone(), admin).unwrap();
    true
}

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::testutils::Address as _;

    #[test]
    fn test_initialize_integration_layer() {
        let env = soroban_sdk::Env::default();
        let admin = Address::generate(&env);
        
        let result = initialize(&env, admin.clone());
        assert!(result);
        
        // Verify registry was initialized
        let guild_addr = Address::generate(&env);
        let reg_result = register_contract(&env, &admin, ContractType::Guild, guild_addr.clone(), 1);
        assert!(reg_result.is_ok());
    }

    #[test]
    fn test_full_integration_flow() {
        let env = soroban_sdk::Env::default();
        let admin = Address::generate(&env);
        
        // Initialize
        initialize(&env, admin.clone());
        
        // Register contracts
        let bounty_addr = Address::generate(&env);
        let treasury_addr = Address::generate(&env);
        
        register_contract(&env, &admin, ContractType::Bounty, bounty_addr.clone(), 1).unwrap();
        register_contract(&env, &admin, ContractType::Treasury, treasury_addr.clone(), 1).unwrap();
        
        // Emit event
        let emit_result = emit_event(
            &env,
            EventType::BountyFunded,
            ContractType::Bounty,
            soroban_sdk::Symbol::new(&env, "test"),
        );
        assert!(emit_result.is_ok());
        
        // Query events
        let events = get_events(&env, None, 0, 10);
        assert_eq!(events.len(), 1);
        
        // Verify contract lookup
        let lookup = get_contract_address(&env, ContractType::Bounty);
        assert!(lookup.is_ok());
        assert_eq!(lookup.unwrap(), bounty_addr);
    }
}
