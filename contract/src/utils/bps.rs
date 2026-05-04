/// Basis Points (BPS) utility for precise financial share calculations.
///
/// BPS is the standard in finance for expressing proportions without
/// floating-point rounding errors. 1 BPS = 0.01%, so 10_000 BPS = 100%.
///
/// # Stellar context
/// Amounts on Stellar are denominated in stroops (1 XLM = 10_000_000 stroops).
/// All arithmetic uses `i128` to safely handle large stroop values without overflow.

/// Maximum basis points representing 100%.
pub const MAX_BPS: i128 = 10_000;

/// Error type for BPS calculation failures.
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
pub enum BpsError {
    /// `bps` exceeds `MAX_BPS` (10_000).
    BpsExceedsMax,
    /// Arithmetic overflow during `total_amount * bps`.
    Overflow,
    /// `total_amount` is negative.
    NegativeAmount,
}

/// Compute the share of `total_amount` that corresponds to `bps` basis points.
///
/// # Formula
/// ```text
/// share = (total_amount * bps) / MAX_BPS
/// ```
///
/// # Arguments
/// * `total_amount` – Total pool amount in stroops (must be ≥ 0).
/// * `bps`          – Basis points to apply (0 – 10_000 inclusive).
///
/// # Returns
/// `Ok(share)` on success, or a [`BpsError`] variant on invalid input / overflow.
///
/// # Examples
/// ```
/// // 500 BPS = 5% of 1_000 stroops → 50 stroops
/// assert_eq!(calculate_share(1_000, 500), Ok(50));
///
/// // 10 BPS of 1_000_000_000 stroops (100 XLM) → 1_000_000 stroops (0.1 XLM)
/// assert_eq!(calculate_share(1_000_000_000, 10), Ok(1_000_000));
/// ```
pub fn calculate_share(total_amount: i128, bps: i128) -> Result<i128, BpsError> {
    if total_amount < 0 {
        return Err(BpsError::NegativeAmount);
    }
    if bps > MAX_BPS {
        return Err(BpsError::BpsExceedsMax);
    }

    let numerator = total_amount
        .checked_mul(bps)
        .ok_or(BpsError::Overflow)?;

    // Division by MAX_BPS is always safe (non-zero constant).
    Ok(numerator / MAX_BPS)
}

// ─── Tests ───────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    // 1 XLM expressed in stroops (Stellar standard: 1 XLM = 10_000_000 stroops).
    const ONE_XLM: i128 = 10_000_000;

    // ── Happy-path share calculations ────────────────────────────────────────

    #[test]
    fn test_500_bps_is_5_percent() {
        // 5% of 1_000 = 50
        assert_eq!(calculate_share(1_000, 500), Ok(50));
    }

    #[test]
    fn test_1000_bps_is_10_percent() {
        // 10% of 1_000 = 100
        assert_eq!(calculate_share(1_000, 1_000), Ok(100));
    }

    #[test]
    fn test_10000_bps_is_full_amount() {
        // 100% of any amount returns the amount unchanged
        assert_eq!(calculate_share(42_000, MAX_BPS), Ok(42_000));
    }

    #[test]
    fn test_0_bps_returns_zero() {
        assert_eq!(calculate_share(1_000_000, 0), Ok(0));
    }

    #[test]
    fn test_zero_total_returns_zero() {
        assert_eq!(calculate_share(0, 500), Ok(0));
    }

    // ── Stellar stroop precision ──────────────────────────────────────────────

    #[test]
    fn test_10_bps_of_100_xlm_is_point_1_xlm_in_stroops() {
        // 100 XLM = 1_000_000_000 stroops
        // 10 BPS  = 0.1% → 0.1 XLM = 1_000_000 stroops
        let total = 100 * ONE_XLM; // 1_000_000_000
        assert_eq!(calculate_share(total, 10), Ok(ONE_XLM / 10));
    }

    #[test]
    fn test_9000_bps_is_90_percent_community_pool() {
        // Typical treasury split: 90% to development
        let treasury: i128 = 1_000 * ONE_XLM;
        let expected = 900 * ONE_XLM;
        assert_eq!(calculate_share(treasury, 9_000), Ok(expected));
    }

    #[test]
    fn test_1000_bps_is_10_percent_community_pool() {
        // Typical treasury split: 10% to community
        let treasury: i128 = 1_000 * ONE_XLM;
        let expected = 100 * ONE_XLM;
        assert_eq!(calculate_share(treasury, 1_000), Ok(expected));
    }

    #[test]
    fn test_community_plus_development_sums_to_total() {
        // 10% + 90% must equal 100% — no stroop is lost
        let treasury: i128 = 1_000 * ONE_XLM;
        let community = calculate_share(treasury, 1_000).unwrap();
        let development = calculate_share(treasury, 9_000).unwrap();
        assert_eq!(community + development, treasury);
    }

    // ── Large-value overflow safety ───────────────────────────────────────────

    #[test]
    fn test_large_amount_does_not_overflow() {
        // i128::MAX / MAX_BPS is the safe ceiling; anything below must succeed.
        let safe_max = i128::MAX / MAX_BPS;
        assert!(calculate_share(safe_max, MAX_BPS).is_ok());
    }

    #[test]
    fn test_overflow_is_detected() {
        // i128::MAX * 1 already overflows when bps > 1 at extreme values.
        assert_eq!(calculate_share(i128::MAX, 2), Err(BpsError::Overflow));
    }

    // ── Guard-rail error cases ────────────────────────────────────────────────

    #[test]
    fn test_bps_exceeds_max_is_rejected() {
        assert_eq!(calculate_share(1_000, MAX_BPS + 1), Err(BpsError::BpsExceedsMax));
    }

    #[test]
    fn test_negative_amount_is_rejected() {
        assert_eq!(calculate_share(-1, 500), Err(BpsError::NegativeAmount));
    }
}
