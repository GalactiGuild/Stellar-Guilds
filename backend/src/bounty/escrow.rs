use soroban_sdk::{Address, Env};

#[derive(Clone, Debug, PartialEq)]
pub struct RefundPayload {
    pub recipient: Address,
    pub amount: i128,
    pub token: Address,
    pub is_eligible: bool,
}

#[derive(Clone, Debug, PartialEq)]
pub enum BountyStatus {
    Open,
    Claimed,
    UnderReview,
    Completed,
    Cancelled,
    Expired,
}

/// Calculate refund eligibility for expired bounties
/// 
/// This function determines if a bounty is eligible for refund based on time expiration
/// and returns the exact refund payload structure.
/// 
/// # Arguments
/// * `bounty_creation_time` - The timestamp when the bounty was created
/// * `current_ledger_time` - The current blockchain ledger timestamp
/// * `expiration_limit` - The duration in seconds after which the bounty expires
/// * `original_sender` - The address that funded the bounty
/// * `reward_amount` - The amount to be refunded
/// * `token_address` - The token contract address
/// * `bounty_status` - Current status of the bounty
/// 
/// # Returns
/// * `RefundPayload` - Structure containing refund details and eligibility
pub fn calculate_refund_eligibility(
    bounty_creation_time: u64,
    current_ledger_time: u64,
    expiration_limit: u64,
    original_sender: Address,
    reward_amount: i128,
    token_address: Address,
    bounty_status: BountyStatus,
) -> RefundPayload {
    let expiration_time = bounty_creation_time.saturating_add(expiration_limit);
    let is_expired = current_ledger_time > expiration_time;
    let is_open_status = matches!(bounty_status, BountyStatus::Open);
    
    let is_eligible = is_expired && is_open_status;
    
    RefundPayload {
        recipient: original_sender,
        amount: if is_eligible { reward_amount } else { 0 },
        token: token_address,
        is_eligible,
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Address};

    #[test]
    fn test_refund_eligible_when_expired_and_open() {
        let creation_time = 1000u64;
        let expiration_limit = 500u64;
        let current_time = 1501u64; // 1 second after expiration
        let sender = Address::generate(&soroban_sdk::Env::default());
        let token = Address::generate(&soroban_sdk::Env::default());
        let amount = 100i128;
        
        let result = calculate_refund_eligibility(
            creation_time,
            current_time,
            expiration_limit,
            sender.clone(),
            amount,
            token.clone(),
            BountyStatus::Open,
        );
        
        assert_eq!(result.is_eligible, true);
        assert_eq!(result.amount, amount);
        assert_eq!(result.recipient, sender);
        assert_eq!(result.token, token);
    }

    #[test]
    fn test_refund_not_eligible_when_not_expired() {
        let creation_time = 1000u64;
        let expiration_limit = 500u64;
        let current_time = 1499u64; // 1 second before expiration
        let sender = Address::generate(&soroban_sdk::Env::default());
        let token = Address::generate(&soroban_sdk::Env::default());
        let amount = 100i128;
        
        let result = calculate_refund_eligibility(
            creation_time,
            current_time,
            expiration_limit,
            sender.clone(),
            amount,
            token.clone(),
            BountyStatus::Open,
        );
        
        assert_eq!(result.is_eligible, false);
        assert_eq!(result.amount, 0);
    }

    #[test]
    fn test_refund_not_eligible_at_exact_expiration_time() {
        let creation_time = 1000u64;
        let expiration_limit = 500u64;
        let current_time = 1500u64; // Exactly at expiration time
        let sender = Address::generate(&soroban_sdk::Env::default());
        let token = Address::generate(&soroban_sdk::Env::default());
        let amount = 100i128;
        
        let result = calculate_refund_eligibility(
            creation_time,
            current_time,
            expiration_limit,
            sender.clone(),
            amount,
            token.clone(),
            BountyStatus::Open,
        );
        
        assert_eq!(result.is_eligible, false);
        assert_eq!(result.amount, 0);
    }

    #[test]
    fn test_refund_not_eligible_when_bounty_claimed() {
        let creation_time = 1000u64;
        let expiration_limit = 500u64;
        let current_time = 1501u64; // After expiration
        let sender = Address::generate(&soroban_sdk::Env::default());
        let token = Address::generate(&soroban_sdk::Env::default());
        let amount = 100i128;
        
        let result = calculate_refund_eligibility(
            creation_time,
            current_time,
            expiration_limit,
            sender.clone(),
            amount,
            token.clone(),
            BountyStatus::Claimed,
        );
        
        assert_eq!(result.is_eligible, false);
        assert_eq!(result.amount, 0);
    }

    #[test]
    fn test_refund_not_eligible_when_bounty_completed() {
        let creation_time = 1000u64;
        let expiration_limit = 500u64;
        let current_time = 1501u64; // After expiration
        let sender = Address::generate(&soroban_sdk::Env::default());
        let token = Address::generate(&soroban_sdk::Env::default());
        let amount = 100i128;
        
        let result = calculate_refund_eligibility(
            creation_time,
            current_time,
            expiration_limit,
            sender.clone(),
            amount,
            token.clone(),
            BountyStatus::Completed,
        );
        
        assert_eq!(result.is_eligible, false);
        assert_eq!(result.amount, 0);
    }

    #[test]
    fn test_refund_with_zero_amount() {
        let creation_time = 1000u64;
        let expiration_limit = 500u64;
        let current_time = 1501u64;
        let sender = Address::generate(&soroban_sdk::Env::default());
        let token = Address::generate(&soroban_sdk::Env::default());
        let amount = 0i128;
        
        let result = calculate_refund_eligibility(
            creation_time,
            current_time,
            expiration_limit,
            sender.clone(),
            amount,
            token.clone(),
            BountyStatus::Open,
        );
        
        assert_eq!(result.is_eligible, true);
        assert_eq!(result.amount, 0);
    }

    #[test]
    fn test_refund_with_large_amounts() {
        let creation_time = 1000u64;
        let expiration_limit = 500u64;
        let current_time = 1501u64;
        let sender = Address::generate(&soroban_sdk::Env::default());
        let token = Address::generate(&soroban_sdk::Env::default());
        let amount = i128::MAX;
        
        let result = calculate_refund_eligibility(
            creation_time,
            current_time,
            expiration_limit,
            sender.clone(),
            amount,
            token.clone(),
            BountyStatus::Open,
        );
        
        assert_eq!(result.is_eligible, true);
        assert_eq!(result.amount, i128::MAX);
    }

    #[test]
    fn test_time_overflow_protection() {
        let creation_time = u64::MAX - 100;
        let expiration_limit = 200u64; // Would overflow without saturating_add
        let current_time = u64::MAX;
        let sender = Address::generate(&soroban_sdk::Env::default());
        let token = Address::generate(&soroban_sdk::Env::default());
        let amount = 100i128;
        
        let result = calculate_refund_eligibility(
            creation_time,
            current_time,
            expiration_limit,
            sender.clone(),
            amount,
            token.clone(),
            BountyStatus::Open,
        );
        
        // Should handle overflow gracefully
        assert_eq!(result.is_eligible, false); // current_time is not > u64::MAX
    }
}