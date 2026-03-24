/// Error Handling Utilities.
///
/// Provides standardized error handling for the integration layer.

use crate::integration::types::IntegrationError;
use soroban_sdk::{Env, String, Symbol};

/// Error context for detailed error reporting.
pub struct ErrorContext {
    pub module: &'static str,
    pub function: &'static str,
    pub details: Option<&'static str>,
}

impl ErrorContext {
    pub fn new(module: &'static str, function: &'static str) -> Self {
        Self {
            module,
            function,
            details: None,
        }
    }

    pub fn with_details(mut self, details: &'static str) -> Self {
        self.details = Some(details);
        self
    }
}

/// Integration error handler.
pub struct IntegrationErrorHandler;

impl IntegrationErrorHandler {
    /// Convert an IntegrationError to a descriptive string.
    pub fn format_error(env: &Env, error: &IntegrationError, ctx: &ErrorContext) -> String {
        let error_msg = match error {
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

        let context_info = match ctx.details {
            Some(details) => format!("{}::{} - {} ({})", ctx.module, ctx.function, error_msg, details),
            None => format!("{}::{} - {}", ctx.module, ctx.function, error_msg),
        };

        String::from_str(env, &context_info)
    }

    /// Log an error (in production would write to event log).
    pub fn log_error(env: &Env, error: &IntegrationError, ctx: &ErrorContext) {
        // In production, would emit an error event
        // For now, this is a placeholder
        let _ = Self::format_error(env, error, ctx);
    }

    /// Handle a result, logging errors if present.
    pub fn handle_result<T>(
        env: &Env,
        result: Result<T, IntegrationError>,
        ctx: &ErrorContext,
    ) -> Result<T, IntegrationError> {
        if let Err(ref e) = result {
            Self::log_error(env, e, ctx);
        }
        result
    }
}

/// Create an error from a code and message.
pub fn create_error(code: u32, _message: &str) -> IntegrationError {
    match code {
        1 => IntegrationError::ContractNotRegistered,
        2 => IntegrationError::InvalidAddress,
        3 => IntegrationError::Unauthorized,
        4 => IntegrationError::EventStorageFull,
        5 => IntegrationError::InvalidEventData,
        6 => IntegrationError::CircularDependency,
        7 => IntegrationError::VersionIncompatible,
        8 => IntegrationError::CallFailed,
        9 => IntegrationError::RegistryCorrupted,
        10 => IntegrationError::InvalidContractType,
        11 => IntegrationError::DuplicateRegistration,
        12 => IntegrationError::EventNotFound,
        13 => IntegrationError::SubscriptionNotFound,
        14 => IntegrationError::InvalidFilter,
        15 => IntegrationError::DataTooLarge,
        16 => IntegrationError::InvalidParameter,
        _ => IntegrationError::CallFailed,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_format_error() {
        let env = Env::default();
        let ctx = ErrorContext::new("integration", "test").with_details("test details");
        let error = IntegrationError::Unauthorized;
        
        let formatted = IntegrationErrorHandler::format_error(&env, &error, &ctx);
        assert!(formatted.contains("Unauthorized"));
        assert!(formatted.contains("integration::test"));
    }
}
