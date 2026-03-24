/// Contract Interface Definitions Module.
///
/// This module defines standardized interfaces for all platform contracts.
/// Interfaces are used for cross-contract calls and type-safe interactions.

pub mod common;
pub mod guild;
pub mod bounty;
pub mod payment;
pub mod treasury;

pub use common::*;
