/// Milestone tracking module
///
/// This module provides project and milestone management for long-running
/// work with phased payments. It integrates with the treasury module using
/// `TransactionType::MilestonePayment` for accounting.
///
/// - `types`: Core data structures and events
/// - `storage`: Persistent storage helpers
/// - `tracker`: Core milestone lifecycle and payment logic

pub mod types;
pub mod storage;
pub mod tracker;

#[cfg(test)]
mod tests;