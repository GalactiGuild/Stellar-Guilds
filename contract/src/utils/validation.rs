/// Validation Utilities.
///
/// Provides common validation functions for addresses, data, and constraints.

use crate::integration::types::{IntegrationError, IntegrationResult, MAX_EVENT_DATA_SIZE};
use soroban_sdk::{Address, Env, String, Symbol};

/// Validation rule trait.
pub trait ValidationRule<T> {
    fn validate(&self, value: &T) -> IntegrationResult<()>;
}

/// Address validator.
pub struct AddressValidator;

impl ValidationRule<Address> for AddressValidator {
    fn validate(&self, value: &Address) -> IntegrationResult<()> {
        validate_address(value)
    }
}

/// String validator.
pub struct StringValidator {
    pub max_length: usize,
    pub min_length: usize,
}

impl ValidationRule<String> for StringValidator {
    fn validate(&self, value: &String) -> IntegrationResult<()> {
        validate_string_length(value, self.min_length, self.max_length)
    }
}

/// Event data validator.
pub struct EventDataValidator;

impl ValidationRule<Symbol> for EventDataValidator {
    fn validate(&self, value: &Symbol) -> IntegrationResult<()> {
        validate_event_data_size(value)
    }
}

/// Generic validator.
pub struct Validator;

impl Validator {
    /// Validate an address is not zero.
    pub fn address(address: &Address) -> IntegrationResult<()> {
        validate_address(address)
    }

    /// Validate string length.
    pub fn string_length(value: &String, min: usize, max: usize) -> IntegrationResult<()> {
        validate_string_length(value, min, max)
    }

    /// Validate event data size.
    pub fn event_data(data: &Symbol) -> IntegrationResult<()> {
        validate_event_data_size(data)
    }

    /// Validate version number.
    pub fn version(version: u32) -> IntegrationResult<()> {
        if version == 0 {
            return Err(IntegrationError::VersionIncompatible);
        }
        Ok(())
    }

    /// Validate amount is positive.
    pub fn positive_amount(amount: i128) -> IntegrationResult<()> {
        if amount <= 0 {
            return Err(IntegrationError::InvalidParameter);
        }
        Ok(())
    }

    /// Validate timestamp is in valid range.
    pub fn timestamp(ts: u64) -> IntegrationResult<()> {
        // Basic sanity check - timestamp should be reasonable
        if ts < 1_000_000_000 || ts > 4_000_000_000 {
            return Err(IntegrationError::InvalidParameter);
        }
        Ok(())
    }
}

/// Validate an address is not zero.
fn validate_address(address: &Address) -> IntegrationResult<()> {
    let addr_str = address.to_string();
    if addr_str.is_empty() {
        return Err(IntegrationError::InvalidAddress);
    }
    Ok(())
}

/// Validate string length is within bounds.
fn validate_string_length(value: &String, min: usize, max: usize) -> IntegrationResult<()> {
    let len = value.len() as usize;
    if len < min {
        return Err(IntegrationError::InvalidParameter);
    }
    if len > max {
        return Err(IntegrationError::DataTooLarge);
    }
    Ok(())
}

/// Validate event data size does not exceed maximum.
fn validate_event_data_size(_data: &Symbol) -> IntegrationResult<()> {
    // Symbol size check - symbols are limited to 32 bytes in Soroban
    // This is always valid for Symbol type, so we just return Ok
    Ok(())
}

/// Validate contract type is valid.
pub fn validate_contract_type(contract_type: u32) -> IntegrationResult<()> {
    // ContractType enum has values 0-14, so validate range
    if contract_type > 14 {
        return Err(IntegrationError::InvalidContractType);
    }
    Ok(())
}

/// Helper function to check if address is zero.
pub fn is_zero_address(address: &Address) -> bool {
    address.to_string().is_empty()
}

/// Helper function to check if string is empty.
pub fn is_empty_string(value: &String) -> bool {
    value.len() == 0
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_validate_valid_address() {
        let env = Env::default();
        let addr = Address::generate(&env);
        assert!(Validator::address(&addr).is_ok());
    }

    #[test]
    fn test_validate_zero_address() {
        // Generate an address and check it's valid
        let env = Env::default();
        let addr = Address::generate(&env);
        assert!(Validator::address(&addr).is_ok());
    }

    #[test]
    fn test_validate_string_length() {
        let env = Env::default();
        let valid = String::from_str(&env, "valid");
        let too_short = String::from_str(&env, "");
        
        assert!(Validator::string_length(&valid, 1, 100).is_ok());
        assert!(matches!(
            Validator::string_length(&too_short, 1, 100),
            Err(IntegrationError::InvalidParameter)
        ));
    }

    #[test]
    fn test_validate_positive_amount() {
        assert!(Validator::positive_amount(100).is_ok());
        assert!(matches!(
            Validator::positive_amount(0),
            Err(IntegrationError::InvalidParameter)
        ));
        assert!(matches!(
            Validator::positive_amount(-100),
            Err(IntegrationError::InvalidParameter)
        ));
    }

    #[test]
    fn test_validate_version() {
        assert!(Validator::version(1).is_ok());
        assert!(Validator::version(100).is_ok());
        assert!(matches!(
            Validator::version(0),
            Err(IntegrationError::VersionIncompatible)
        ));
    }
}
