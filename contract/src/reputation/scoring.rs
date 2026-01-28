use soroban_sdk::Env;

use super::types::{ReputationEvent, ReputationTier};

// ============ Reputation Scoring Rules ============

/// Calculate score change based on event type and value
///
/// # Scoring Rules:
/// - Task completion: +10 to +50 (based on complexity)
/// - Milestone completion: +20 to +100
/// - Dispute won: +5
/// - Dispute lost: -20
/// - Task failed/cancelled: -10
/// - Time decay: -1% per month of inactivity
/// - Success rate bonus: up to +50% for >95% success
pub fn calculate_score_change(
    event: ReputationEvent,
    value: u32,
    _current_score: u32,
) -> i32 {
    match event {
        ReputationEvent::TaskCompleted => {
            // value represents complexity (1-5)
            let base_points = 10u32;
            let complexity_multiplier = if value > 0 && value <= 5 { value } else { 1 };
            (base_points * complexity_multiplier) as i32
        }
        ReputationEvent::MilestoneAchieved => {
            // value represents milestone significance (1-5)
            let base_points = 20u32;
            let significance_multiplier = if value > 0 && value <= 5 { value } else { 1 };
            (base_points * significance_multiplier) as i32
        }
        ReputationEvent::DisputeWon => 5i32,
        ReputationEvent::DisputeLost => -20i32,
        ReputationEvent::TaskFailed => -10i32,
        ReputationEvent::TimeDecay => {
            // value represents months of inactivity
            // -1% per month, but minimum -50%
            let decay_percentage = if value > 50 { 50 } else { value };
            -(decay_percentage as i32)
        }
        ReputationEvent::SuccessRateBonus => {
            // value represents success rate (0-100)
            // Bonus for >95% success rate
            if value >= 95 {
                50i32 // +50 points bonus
            } else {
                0i32
            }
        }
    }
}

/// Calculate reputation tier based on score
///
/// # Tier Thresholds:
/// - Bronze: 0-99 points
/// - Silver: 100-499 points
/// - Gold: 500-1499 points
/// - Platinum: 1500-4999 points
/// - Diamond: 5000+ points
pub fn calculate_tier(score: u32) -> ReputationTier {
    if score >= 5000 {
        ReputationTier::Diamond
    } else if score >= 1500 {
        ReputationTier::Platinum
    } else if score >= 500 {
        ReputationTier::Gold
    } else if score >= 100 {
        ReputationTier::Silver
    } else {
        ReputationTier::Bronze
    }
}

/// Calculate incentive multiplier based on reputation tier
///
/// # Multipliers (basis points, 100 = 1.0x):
/// - Bronze: 100 (1.0x)
/// - Silver: 110 (1.1x)
/// - Gold: 125 (1.25x)
/// - Platinum: 150 (1.5x)
/// - Diamond: 200 (2.0x)
pub fn calculate_incentive_multiplier(tier: ReputationTier) -> u32 {
    match tier {
        ReputationTier::Bronze => 100,
        ReputationTier::Silver => 110,
        ReputationTier::Gold => 125,
        ReputationTier::Platinum => 150,
        ReputationTier::Diamond => 200,
    }
}

/// Calculate success rate percentage
pub fn calculate_success_rate(tasks_completed: u32, tasks_failed: u32) -> u32 {
    let total_tasks = tasks_completed + tasks_failed;
    if total_tasks == 0 {
        100 // Default to 100% for new contributors
    } else {
        // Calculate percentage: (completed / total) * 100
        (tasks_completed * 100) / total_tasks
    }
}

/// Calculate time decay based on months of inactivity
///
/// Returns the amount to subtract from score (always positive)
pub fn calculate_time_decay(env: &Env, last_activity: u64, current_score: u32) -> u32 {
    let current_time = env.ledger().timestamp();

    // Calculate months of inactivity
    let seconds_inactive = if current_time > last_activity {
        current_time - last_activity
    } else {
        0
    };

    let seconds_per_month: u64 = 30 * 24 * 60 * 60; // 30 days
    let months_inactive = seconds_inactive / seconds_per_month;

    // -1% per month, capped at 50%
    let decay_percentage = if months_inactive > 50 {
        50u32
    } else {
        months_inactive as u32
    };

    // Calculate decay amount
    let decay_amount = (current_score * decay_percentage) / 100;

    decay_amount
}

/// Apply score change with bounds checking (score cannot go below 0)
pub fn apply_score_change(current_score: u32, change: i32) -> u32 {
    if change < 0 {
        let decrease = (-change) as u32;
        if decrease > current_score {
            0 // Can't go below 0
        } else {
            current_score - decrease
        }
    } else {
        current_score.saturating_add(change as u32)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_calculate_tier() {
        assert_eq!(calculate_tier(0), ReputationTier::Bronze);
        assert_eq!(calculate_tier(99), ReputationTier::Bronze);
        assert_eq!(calculate_tier(100), ReputationTier::Silver);
        assert_eq!(calculate_tier(499), ReputationTier::Silver);
        assert_eq!(calculate_tier(500), ReputationTier::Gold);
        assert_eq!(calculate_tier(1499), ReputationTier::Gold);
        assert_eq!(calculate_tier(1500), ReputationTier::Platinum);
        assert_eq!(calculate_tier(4999), ReputationTier::Platinum);
        assert_eq!(calculate_tier(5000), ReputationTier::Diamond);
        assert_eq!(calculate_tier(10000), ReputationTier::Diamond);
    }

    #[test]
    fn test_calculate_incentive_multiplier() {
        assert_eq!(
            calculate_incentive_multiplier(ReputationTier::Bronze),
            100
        );
        assert_eq!(
            calculate_incentive_multiplier(ReputationTier::Silver),
            110
        );
        assert_eq!(calculate_incentive_multiplier(ReputationTier::Gold), 125);
        assert_eq!(
            calculate_incentive_multiplier(ReputationTier::Platinum),
            150
        );
        assert_eq!(
            calculate_incentive_multiplier(ReputationTier::Diamond),
            200
        );
    }

    #[test]
    fn test_calculate_success_rate() {
        assert_eq!(calculate_success_rate(0, 0), 100); // New contributor
        assert_eq!(calculate_success_rate(10, 0), 100); // Perfect record
        assert_eq!(calculate_success_rate(50, 50), 50); // 50% success
        assert_eq!(calculate_success_rate(95, 5), 95); // 95% success
        assert_eq!(calculate_success_rate(1, 9), 10); // 10% success
    }

    #[test]
    fn test_apply_score_change() {
        assert_eq!(apply_score_change(100, 50), 150); // Add points
        assert_eq!(apply_score_change(100, -30), 70); // Subtract points
        assert_eq!(apply_score_change(20, -50), 0); // Can't go below 0
        assert_eq!(apply_score_change(0, -10), 0); // Already at 0
        assert_eq!(apply_score_change(u32::MAX - 10, 20), u32::MAX); // Saturating add
    }

    #[test]
    fn test_score_change_calculations() {
        // Task completed with various complexities
        assert_eq!(
            calculate_score_change(ReputationEvent::TaskCompleted, 1, 0),
            10
        );
        assert_eq!(
            calculate_score_change(ReputationEvent::TaskCompleted, 3, 0),
            30
        );
        assert_eq!(
            calculate_score_change(ReputationEvent::TaskCompleted, 5, 0),
            50
        );

        // Milestone with various significance
        assert_eq!(
            calculate_score_change(ReputationEvent::MilestoneAchieved, 1, 0),
            20
        );
        assert_eq!(
            calculate_score_change(ReputationEvent::MilestoneAchieved, 5, 0),
            100
        );

        // Fixed events
        assert_eq!(calculate_score_change(ReputationEvent::DisputeWon, 0, 0), 5);
        assert_eq!(
            calculate_score_change(ReputationEvent::DisputeLost, 0, 0),
            -20
        );
        assert_eq!(
            calculate_score_change(ReputationEvent::TaskFailed, 0, 0),
            -10
        );

        // Success rate bonus
        assert_eq!(
            calculate_score_change(ReputationEvent::SuccessRateBonus, 95, 0),
            50
        );
        assert_eq!(
            calculate_score_change(ReputationEvent::SuccessRateBonus, 94, 0),
            0
        );
    }
}
