use soroban_sdk::{Env, panic_with_error};

/// Calculates the vested amount based on linear vesting schedule
/// 
/// # Arguments
/// * `total_amount` - Total amount to be vested
/// * `start_time` - Vesting start timestamp
/// * `end_time` - Vesting end timestamp  
/// * `current_time` - Current timestamp to calculate vesting for
///
/// # Returns
/// * `i128` - The amount that has vested at current_time
///
/// # Panics
/// * If start_time >= end_time
/// * If total_amount is negative
pub fn calculate_vested_amount(
    env: &Env,
    total_amount: i128,
    start_time: u64,
    end_time: u64,
    current_time: u64,
) -> i128 {
    // Validate inputs
    if total_amount < 0 {
        panic_with_error!(env, VestingError::InvalidAmount);
    }
    
    if start_time >= end_time {
        panic_with_error!(env, VestingError::InvalidTimeRange);
    }

    // If current time is before start, nothing is vested
    if current_time < start_time {
        return 0;
    }

    // If current time is after end, everything is vested
    if current_time >= end_time {
        return total_amount;
    }

    // Calculate linear vesting
    let elapsed_time = current_time - start_time;
    let total_duration = end_time - start_time;
    
    // Use safe multiplication to prevent overflow
    // Calculate: (total_amount * elapsed_time) / total_duration
    let numerator = safe_multiply(env, total_amount, elapsed_time as i128);
    let vested_amount = numerator / (total_duration as i128);
    
    vested_amount
}

/// Safely multiplies two i128 values, checking for overflow
fn safe_multiply(env: &Env, a: i128, b: i128) -> i128 {
    match a.checked_mul(b) {
        Some(result) => result,
        None => panic_with_error!(env, VestingError::Overflow),
    }
}

/// Error types for vesting calculations
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum VestingError {
    InvalidAmount = 1,
    InvalidTimeRange = 2,
    Overflow = 3,
}

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::{testutils::Logs, Env};

    #[test]
    fn test_vesting_before_start() {
        let env = Env::default();
        let result = calculate_vested_amount(&env, 1000, 100, 200, 50);
        assert_eq!(result, 0);
    }

    #[test] 
    fn test_vesting_after_end() {
        let env = Env::default();
        let result = calculate_vested_amount(&env, 1000, 100, 200, 250);
        assert_eq!(result, 1000);
    }

    #[test]
    fn test_linear_vesting_halfway() {
        let env = Env::default();
        let result = calculate_vested_amount(&env, 1000, 100, 200, 150);
        assert_eq!(result, 500); // 50% through vesting period
    }

    #[test]
    fn test_linear_vesting_quarter() {
        let env = Env::default();
        let result = calculate_vested_amount(&env, 1000, 100, 200, 125);
        assert_eq!(result, 250); // 25% through vesting period
    }

    #[test]
    fn test_linear_vesting_three_quarters() {
        let env = Env::default();
        let result = calculate_vested_amount(&env, 1000, 100, 200, 175);
        assert_eq!(result, 750); // 75% through vesting period
    }

    #[test]
    fn test_zero_amount() {
        let env = Env::default();
        let result = calculate_vested_amount(&env, 0, 100, 200, 150);
        assert_eq!(result, 0);
    }

    #[test]
    fn test_large_amounts() {
        let env = Env::default();
        let total_amount = 100_000_000i128; // $100k equivalent
        let result = calculate_vested_amount(&env, total_amount, 1000, 2000, 1500);
        assert_eq!(result, 50_000_000); // 50% vested
    }

    #[test]
    fn test_precision_no_dust() {
        let env = Env::default();
        // Test odd amounts that could create precision issues
        let result = calculate_vested_amount(&env, 333, 0, 3, 1);
        assert_eq!(result, 111); // Should be exactly 1/3
    }

    #[test]
    fn test_single_block_duration() {
        let env = Env::default();
        let result = calculate_vested_amount(&env, 1000, 100, 101, 100);
        assert_eq!(result, 0); // At start time
        
        let result2 = calculate_vested_amount(&env, 1000, 100, 101, 101);
        assert_eq!(result2, 1000); // At end time
    }

    #[test]
    #[should_panic]
    fn test_negative_amount() {
        let env = Env::default();
        calculate_vested_amount(&env, -1000, 100, 200, 150);
    }

    #[test]
    #[should_panic]
    fn test_invalid_time_range() {
        let env = Env::default();
        calculate_vested_amount(&env, 1000, 200, 100, 150); // start > end
    }

    #[test]
    #[should_panic]
    fn test_equal_start_end_time() {
        let env = Env::default();
        calculate_vested_amount(&env, 1000, 100, 100, 150); // start == end
    }

    #[test]
    fn test_maximum_safe_values() {
        let env = Env::default();
        let max_safe = i128::MAX / 1000; // Avoid overflow in test
        let result = calculate_vested_amount(&env, max_safe, 0, 1000, 500);
        assert_eq!(result, max_safe / 2); // 50% vested
    }
}