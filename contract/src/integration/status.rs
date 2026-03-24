/// Integration status tracking.

use crate::integration::types::IntegrationStatus;
use crate::integration::{registry, events};
use soroban_sdk::Env;

/// Get comprehensive integration status.
pub fn get_integration_status(env: &Env) -> IntegrationStatus {
    let contract_count = registry::get_all_contracts(env).len();
    let event_count = events::get_event_count(env);
    
    IntegrationStatus {
        contract_count,
        event_count,
        is_initialized: true,
    }
}
