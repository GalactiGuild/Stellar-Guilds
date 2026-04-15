use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env, Vec};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct PayoutRecipient {
    pub address: Address,
    pub bps: u32, // Basis points (1/10000)
}

const BPS_TOTAL: u32 = 10_000;

#[contract]
pub struct BountyEscrow;

#[contractimpl]
impl BountyEscrow {
    /// Distribute payout to multiple recipients based on basis points
    /// BPS (Basis Points) must sum to exactly 10,000 (100%)
    pub fn distribute_payout(
        env: Env,
        bounty_id: u64,
        total_amount: i128,
        recipients: Vec<PayoutRecipient>,
    ) -> Result<Vec<(Address, i128)>, &'static str> {
        // Validate that recipients list is not empty
        if recipients.is_empty() {
            return Err("Recipients list cannot be empty");
        }

        // Validate that BPS sum equals 10,000
        let mut total_bps: u32 = 0;
        for recipient in recipients.iter() {
            total_bps += recipient.bps;
        }
        
        if total_bps != BPS_TOTAL {
            return Err("BPS must sum to exactly 10,000");
        }

        let mut payouts: Vec<(Address, i128)> = Vec::new(&env);
        let mut distributed_amount: i128 = 0;

        // Calculate individual payouts
        for (index, recipient) in recipients.iter().enumerate() {
            let payout_amount = if index == recipients.len() - 1 {
                // Last recipient gets remainder to handle dust
                total_amount - distributed_amount
            } else {
                // Calculate proportional amount
                (total_amount * recipient.bps as i128) / BPS_TOTAL as i128
            };
            
            payouts.push_back((recipient.address.clone(), payout_amount));
            distributed_amount += payout_amount;
        }

        // Emit event for payout distribution
        env.events().publish(
            (symbol_short!("payout"), bounty_id),
            (total_amount, payouts.clone()),
        );

        Ok(payouts)
    }

    /// Single recipient payout (backwards compatibility)
    pub fn single_payout(
        env: Env,
        bounty_id: u64,
        total_amount: i128,
        recipient: Address,
    ) -> Result<Vec<(Address, i128)>, &'static str> {
        let recipients = Vec::from_array(
            &env,
            [PayoutRecipient {
                address: recipient,
                bps: BPS_TOTAL,
            }],
        );
        
        Self::distribute_payout(env, bounty_id, total_amount, recipients)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Address, Env};

    #[test]
    fn test_equal_split_two_recipients() {
        let env = Env::default();
        let addr1 = Address::generate(&env);
        let addr2 = Address::generate(&env);
        
        let recipients = Vec::from_array(
            &env,
            [
                PayoutRecipient { address: addr1.clone(), bps: 5000 },
                PayoutRecipient { address: addr2.clone(), bps: 5000 },
            ],
        );
        
        let result = BountyEscrow::distribute_payout(env, 1, 1000, recipients).unwrap();
        
        assert_eq!(result.len(), 2);
        assert_eq!(result.get(0).unwrap().1, 500);
        assert_eq!(result.get(1).unwrap().1, 500);
    }

    #[test]
    fn test_unequal_split_three_recipients() {
        let env = Env::default();
        let addr1 = Address::generate(&env);
        let addr2 = Address::generate(&env);
        let addr3 = Address::generate(&env);
        
        let recipients = Vec::from_array(
            &env,
            [
                PayoutRecipient { address: addr1.clone(), bps: 3333 }, // 33.33%
                PayoutRecipient { address: addr2.clone(), bps: 3333 }, // 33.33%
                PayoutRecipient { address: addr3.clone(), bps: 3334 }, // 33.34%
            ],
        );
        
        let result = BountyEscrow::distribute_payout(env, 1, 1000, recipients).unwrap();
        
        assert_eq!(result.len(), 3);
        assert_eq!(result.get(0).unwrap().1, 333);
        assert_eq!(result.get(1).unwrap().1, 333);
        assert_eq!(result.get(2).unwrap().1, 334); // Gets the remainder
        
        // Verify total equals original amount
        let total: i128 = result.iter().map(|r| r.1).sum();
        assert_eq!(total, 1000);
    }

    #[test]
    fn test_dust_handling() {
        let env = Env::default();
        let addr1 = Address::generate(&env);
        let addr2 = Address::generate(&env);
        
        let recipients = Vec::from_array(
            &env,
            [
                PayoutRecipient { address: addr1.clone(), bps: 3333 },
                PayoutRecipient { address: addr2.clone(), bps: 6667 },
            ],
        );
        
        let result = BountyEscrow::distribute_payout(env, 1, 997, recipients).unwrap();
        
        assert_eq!(result.len(), 2);
        assert_eq!(result.get(0).unwrap().1, 332); // 997 * 3333 / 10000 = 332.1001 -> 332
        assert_eq!(result.get(1).unwrap().1, 665); // Remainder: 997 - 332 = 665
        
        // Verify total equals original amount
        let total: i128 = result.iter().map(|r| r.1).sum();
        assert_eq!(total, 997);
    }

    #[test]
    fn test_invalid_bps_sum() {
        let env = Env::default();
        let addr1 = Address::generate(&env);
        let addr2 = Address::generate(&env);
        
        let recipients = Vec::from_array(
            &env,
            [
                PayoutRecipient { address: addr1, bps: 5000 },
                PayoutRecipient { address: addr2, bps: 4000 }, // Only sums to 9000
            ],
        );
        
        let result = BountyEscrow::distribute_payout(env, 1, 1000, recipients);
        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), "BPS must sum to exactly 10,000");
    }

    #[test]
    fn test_empty_recipients() {
        let env = Env::default();
        let recipients = Vec::new(&env);
        
        let result = BountyEscrow::distribute_payout(env, 1, 1000, recipients);
        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), "Recipients list cannot be empty");
    }

    #[test]
    fn test_single_recipient_backwards_compatibility() {
        let env = Env::default();
        let addr = Address::generate(&env);
        
        let result = BountyEscrow::single_payout(env, 1, 1000, addr.clone()).unwrap();
        
        assert_eq!(result.len(), 1);
        assert_eq!(result.get(0).unwrap().0, addr);
        assert_eq!(result.get(0).unwrap().1, 1000);
    }

    #[test]
    fn test_70_30_split() {
        let env = Env::default();
        let addr1 = Address::generate(&env);
        let addr2 = Address::generate(&env);
        
        let recipients = Vec::from_array(
            &env,
            [
                PayoutRecipient { address: addr1.clone(), bps: 7000 }, // 70%
                PayoutRecipient { address: addr2.clone(), bps: 3000 }, // 30%
            ],
        );
        
        let result = BountyEscrow::distribute_payout(env, 1, 1000, recipients).unwrap();
        
        assert_eq!(result.len(), 2);
        assert_eq!(result.get(0).unwrap().1, 700);
        assert_eq!(result.get(1).unwrap().1, 300);
    }
}