/// Common interface types and utilities.

use soroban_sdk::{contracttype, Address, Env, String, Symbol, Vec};

/// Standard error type for interface operations.
#[contracttype]
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum InterfaceError {
    ContractNotInitialized,
    InvalidParameter,
    CallFailed,
    Unauthorized,
    NotFound,
    AlreadyExists,
    InvalidState,
    VersionMismatch,
}

/// Result type alias for interface operations.
pub type InterfaceResult<T> = Result<T, InterfaceError>;

/// Validate an address is not zero.
pub fn validate_address(_env: &Env, address: &Address) -> bool {
    let zero_addr = Address::from_public_key(&[0u8; 32]);
    address != &zero_addr
}

/// Format an error message.
pub fn format_error(env: &Env, error_code: InterfaceError, _context: &str) -> Symbol {
    let error_str = match error_code {
        InterfaceError::ContractNotInitialized => "ContractNotInit",
        InterfaceError::InvalidParameter => "InvalidParam",
        InterfaceError::CallFailed => "CallFailed",
        InterfaceError::Unauthorized => "Unauthorized",
        InterfaceError::NotFound => "NotFound",
        InterfaceError::AlreadyExists => "AlreadyExists",
        InterfaceError::InvalidState => "InvalidState",
        InterfaceError::VersionMismatch => "VersionMismatch",
    };
    Symbol::new(env, error_str)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_validate_address() {
        let env = Env::default();
        let addr = Address::generate(&env);
        assert!(validate_address(&env, &addr));
    }
}
