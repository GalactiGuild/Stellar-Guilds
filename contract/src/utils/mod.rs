/// Utility Functions Module.
///
/// Provides common utilities for validation, error handling, and helper functions
/// used across the integration layer.

pub mod errors;
pub mod validation;

pub use errors::{IntegrationErrorHandler, ErrorContext};
pub use validation::{Validator, ValidationRule};
