/// Integration utilities.

use crate::integration::types::IntegrationError;
use soroban_sdk::{Address, Env, String, Symbol};

/// Validate an address is not zero.
pub fn validate_address(_env: &Env, address: &Address) -> bool {
    // Check if address string representation is not empty
    let addr_str = address.to_string();
    !addr_str.is_empty()
}

/// Format an error with context.
pub fn format_error(env: &Env, error_code: IntegrationError, _context: &String) -> Symbol {
    let error_str = match error_code {
        IntegrationError::ContractNotRegistered => "ContractNotRegistered",
        IntegrationError::InvalidAddress => "InvalidAddress",
        IntegrationError::Unauthorized => "Unauthorized",
        IntegrationError::EventStorageFull => "EventStorageFull",
        IntegrationError::InvalidEventData => "InvalidEventData",
        IntegrationError::CircularDependency => "CircularDependency",
        IntegrationError::VersionIncompatible => "VersionIncompatible",
        IntegrationError::CallFailed => "CallFailed",
        IntegrationError::RegistryCorrupted => "RegistryCorrupted",
        IntegrationError::InvalidContractType => "InvalidContractType",
        IntegrationError::DuplicateRegistration => "DuplicateRegistration",
        IntegrationError::EventNotFound => "EventNotFound",
        IntegrationError::SubscriptionNotFound => "SubscriptionNotFound",
        IntegrationError::InvalidFilter => "InvalidFilter",
        IntegrationError::DataTooLarge => "DataTooLarge",
        IntegrationError::InvalidParameter => "InvalidParameter",
    };
    
    // Return just the error symbol - context is for debugging
    Symbol::new(env, error_str)
}
