#[cfg(test)]
mod reputation_tests {
    use crate::reputation::types::{ReputationEvent, ReputationTier};
    use crate::reputation::{
        award_achievement, check_achievement_eligibility, get_achievements, get_reputation,
        get_tier, get_top_contributors_for_guild, initialize_profile, initialize_reputation_system,
        update_guild_leaderboard, update_reputation, calculate_multiplier, apply_time_decay,
    };
    use soroban_sdk::testutils::Address as _;
    use soroban_sdk::{Address, Env};

    fn setup() -> Env {
        let env = Env::default();
        env.budget().reset_unlimited();
        initialize_reputation_system(&env);
        env
    }

    // ============ Profile Initialization Tests ============

    #[test]
    fn test_initialize_new_profile() {
        let env = setup();
        let address = Address::generate(&env);

        let profile = initialize_profile(&env, address.clone());

        assert_eq!(profile.address, address);
        assert_eq!(profile.score, 0);
        assert_eq!(profile.tier, ReputationTier::Bronze);
        assert_eq!(profile.tasks_completed, 0);
        assert_eq!(profile.tasks_failed, 0);
        assert_eq!(profile.success_rate, 100);
        assert_eq!(profile.achievements.len(), 0);
        assert_eq!(profile.disputes_won, 0);
        assert_eq!(profile.disputes_lost, 0);
        assert_eq!(profile.milestones_completed, 0);
    }

    #[test]
    #[should_panic(expected = "Profile already exists")]
    fn test_initialize_duplicate_profile() {
        let env = setup();
        let address = Address::generate(&env);

        initialize_profile(&env, address.clone());
        initialize_profile(&env, address); // Should panic
    }

    // ============ Task Completion Tests ============

    #[test]
    fn test_task_completion_simple() {
        let env = setup();
        let address = Address::generate(&env);

        // Complete a simple task (complexity 1)
        let score = update_reputation(&env, address.clone(), ReputationEvent::TaskCompleted, 1);
        assert_eq!(score, 10);

        let profile = get_reputation(&env, address);
        assert_eq!(profile.tasks_completed, 1);
        assert_eq!(profile.success_rate, 100);
    }

    #[test]
    fn test_task_completion_complex() {
        let env = setup();
        let address = Address::generate(&env);

        // Complete a complex task (complexity 5)
        let score = update_reputation(&env, address.clone(), ReputationEvent::TaskCompleted, 5);
        assert_eq!(score, 50); // 10 * 5

        let profile = get_reputation(&env, address);
        assert_eq!(profile.tasks_completed, 1);
    }

    #[test]
    fn test_multiple_task_completions() {
        let env = setup();
        let address = Address::generate(&env);

        // Complete 5 tasks with varying complexity
        update_reputation(&env, address.clone(), ReputationEvent::TaskCompleted, 1); // +10
        update_reputation(&env, address.clone(), ReputationEvent::TaskCompleted, 2); // +20
        update_reputation(&env, address.clone(), ReputationEvent::TaskCompleted, 3); // +30
        update_reputation(&env, address.clone(), ReputationEvent::TaskCompleted, 4); // +40
        let final_score = update_reputation(&env, address.clone(), ReputationEvent::TaskCompleted, 5); // +50

        assert_eq!(final_score, 150); // Total: 10+20+30+40+50

        let profile = get_reputation(&env, address);
        assert_eq!(profile.tasks_completed, 5);
        assert_eq!(profile.tier, ReputationTier::Silver); // Should be Silver tier
    }

    // ============ Task Failure Tests ============

    #[test]
    fn test_task_failure() {
        let env = setup();
        let address = Address::generate(&env);

        // Complete a task first
        update_reputation(&env, address.clone(), ReputationEvent::TaskCompleted, 3); // +30

        // Fail a task
        let score = update_reputation(&env, address.clone(), ReputationEvent::TaskFailed, 0); // -10
        assert_eq!(score, 20);

        let profile = get_reputation(&env, address);
        assert_eq!(profile.tasks_completed, 1);
        assert_eq!(profile.tasks_failed, 1);
        assert_eq!(profile.success_rate, 50); // 1 success / 2 total = 50%
    }

    #[test]
    fn test_reputation_cannot_go_below_zero() {
        let env = setup();
        let address = Address::generate(&env);

        // Start with 30 points
        update_reputation(&env, address.clone(), ReputationEvent::TaskCompleted, 3);

        // Fail multiple tasks to try to go negative
        update_reputation(&env, address.clone(), ReputationEvent::TaskFailed, 0); // -10
        update_reputation(&env, address.clone(), ReputationEvent::TaskFailed, 0); // -10
        update_reputation(&env, address.clone(), ReputationEvent::TaskFailed, 0); // -10
        let final_score = update_reputation(&env, address.clone(), ReputationEvent::TaskFailed, 0); // -10

        assert_eq!(final_score, 0); // Should stop at 0, not go negative

        let profile = get_reputation(&env, address);
        assert_eq!(profile.score, 0);
    }

    // ============ Tier Progression Tests ============

    #[test]
    fn test_tier_progression_bronze_to_silver() {
        let env = setup();
        let address = Address::generate(&env);

        // Start at Bronze
        assert_eq!(get_tier(&env, address.clone()), ReputationTier::Bronze);

        // Reach Silver (100 points)
        for _ in 0..4 {
            update_reputation(&env, address.clone(), ReputationEvent::TaskCompleted, 5); // +50 each
        }

        assert_eq!(get_tier(&env, address), ReputationTier::Silver);
    }

    #[test]
    fn test_tier_progression_to_gold() {
        let env = setup();
        let address = Address::generate(&env);

        // Reach Gold (500 points)
        for _ in 0..10 {
            update_reputation(&env, address.clone(), ReputationEvent::TaskCompleted, 5); // +50 each
        }

        assert_eq!(get_tier(&env, address.clone()), ReputationTier::Gold);

        let profile = get_reputation(&env, address);
        assert_eq!(profile.score, 500);
    }

    #[test]
    fn test_tier_progression_to_platinum() {
        let env = setup();
        let address = Address::generate(&env);

        // Reach Platinum (1500 points)
        for _ in 0..30 {
            update_reputation(&env, address.clone(), ReputationEvent::TaskCompleted, 5); // +50 each
        }

        assert_eq!(get_tier(&env, address.clone()), ReputationTier::Platinum);

        let profile = get_reputation(&env, address);
        assert_eq!(profile.score, 1500);
    }

    #[test]
    fn test_tier_progression_to_diamond() {
        let env = setup();
        let address = Address::generate(&env);

        // Reach Diamond (5000 points)
        for _ in 0..100 {
            update_reputation(&env, address.clone(), ReputationEvent::TaskCompleted, 5); // +50 each
        }

        assert_eq!(get_tier(&env, address.clone()), ReputationTier::Diamond);

        let profile = get_reputation(&env, address);
        assert_eq!(profile.score, 5000);
    }

    // ============ Milestone Tests ============

    #[test]
    fn test_milestone_achievement() {
        let env = setup();
        let address = Address::generate(&env);

        // Complete milestone with significance 3
        let score = update_reputation(&env, address.clone(), ReputationEvent::MilestoneAchieved, 3);
        assert_eq!(score, 60); // 20 * 3

        let profile = get_reputation(&env, address);
        assert_eq!(profile.milestones_completed, 1);
    }

    #[test]
    fn test_multiple_milestones() {
        let env = setup();
        let address = Address::generate(&env);

        // Complete 5 milestones
        for i in 1..=5 {
            update_reputation(&env, address.clone(), ReputationEvent::MilestoneAchieved, i);
        }

        let profile = get_reputation(&env, address);
        assert_eq!(profile.milestones_completed, 5);
        // Score: 20 + 40 + 60 + 80 + 100 = 300
        assert_eq!(profile.score, 300);
    }

    // ============ Dispute Tests ============

    #[test]
    fn test_dispute_won() {
        let env = setup();
        let address = Address::generate(&env);

        let score = update_reputation(&env, address.clone(), ReputationEvent::DisputeWon, 0);
        assert_eq!(score, 5);

        let profile = get_reputation(&env, address);
        assert_eq!(profile.disputes_won, 1);
    }

    #[test]
    fn test_dispute_lost() {
        let env = setup();
        let address = Address::generate(&env);

        // Earn some points first
        update_reputation(&env, address.clone(), ReputationEvent::TaskCompleted, 5); // +50

        // Lose a dispute
        let score = update_reputation(&env, address.clone(), ReputationEvent::DisputeLost, 0);
        assert_eq!(score, 30); // 50 - 20

        let profile = get_reputation(&env, address);
        assert_eq!(profile.disputes_lost, 1);
    }

    // ============ Success Rate Tests ============

    #[test]
    fn test_success_rate_perfect() {
        let env = setup();
        let address = Address::generate(&env);

        // Complete 10 tasks with no failures
        for _ in 0..10 {
            update_reputation(&env, address.clone(), ReputationEvent::TaskCompleted, 1);
        }

        let profile = get_reputation(&env, address);
        assert_eq!(profile.success_rate, 100);
    }

    #[test]
    fn test_success_rate_mixed() {
        let env = setup();
        let address = Address::generate(&env);

        // Complete 8 tasks
        for _ in 0..8 {
            update_reputation(&env, address.clone(), ReputationEvent::TaskCompleted, 1);
        }

        // Fail 2 tasks
        for _ in 0..2 {
            update_reputation(&env, address.clone(), ReputationEvent::TaskFailed, 0);
        }

        let profile = get_reputation(&env, address);
        assert_eq!(profile.success_rate, 80); // 8/10 = 80%
    }

    // ============ Incentive Multiplier Tests ============

    #[test]
    fn test_incentive_multiplier_bronze() {
        let env = setup();
        let address = Address::generate(&env);

        initialize_profile(&env, address.clone());

        let multiplier = calculate_multiplier(&env, address);
        assert_eq!(multiplier, 100); // 1.0x
    }

    #[test]
    fn test_incentive_multiplier_silver() {
        let env = setup();
        let address = Address::generate(&env);

        // Reach Silver tier (100 points)
        for _ in 0..4 {
            update_reputation(&env, address.clone(), ReputationEvent::TaskCompleted, 5);
        }

        let multiplier = calculate_multiplier(&env, address);
        assert_eq!(multiplier, 110); // 1.1x
    }

    #[test]
    fn test_incentive_multiplier_gold() {
        let env = setup();
        let address = Address::generate(&env);

        // Reach Gold tier (500 points)
        for _ in 0..10 {
            update_reputation(&env, address.clone(), ReputationEvent::TaskCompleted, 5);
        }

        let multiplier = calculate_multiplier(&env, address);
        assert_eq!(multiplier, 125); // 1.25x
    }

    #[test]
    fn test_incentive_multiplier_platinum() {
        let env = setup();
        let address = Address::generate(&env);

        // Reach Platinum tier (1500 points)
        for _ in 0..30 {
            update_reputation(&env, address.clone(), ReputationEvent::TaskCompleted, 5);
        }

        let multiplier = calculate_multiplier(&env, address);
        assert_eq!(multiplier, 150); // 1.5x
    }

    #[test]
    fn test_incentive_multiplier_diamond() {
        let env = setup();
        let address = Address::generate(&env);

        // Reach Diamond tier (5000 points)
        for _ in 0..100 {
            update_reputation(&env, address.clone(), ReputationEvent::TaskCompleted, 5);
        }

        let multiplier = calculate_multiplier(&env, address);
        assert_eq!(multiplier, 200); // 2.0x
    }

    // ============ Achievement Tests ============

    #[test]
    fn test_award_first_task_achievement() {
        let env = setup();
        let address = Address::generate(&env);

        // Complete first task
        update_reputation(&env, address.clone(), ReputationEvent::TaskCompleted, 1);

        // Award "First Steps" achievement (ID 1)
        let awarded = award_achievement(&env, address.clone(), 1);
        assert_eq!(awarded, true);

        let achievements = get_achievements(&env, address.clone());
        assert_eq!(achievements.len(), 1);

        let profile = get_reputation(&env, address);
        assert_eq!(profile.achievements.len(), 1);
    }

    #[test]
    fn test_cannot_award_same_achievement_twice() {
        let env = setup();
        let address = Address::generate(&env);

        // Complete first task
        update_reputation(&env, address.clone(), ReputationEvent::TaskCompleted, 1);

        // Award achievement
        award_achievement(&env, address.clone(), 1);

        // Try to award again
        let awarded = award_achievement(&env, address.clone(), 1);
        assert_eq!(awarded, false);
    }

    #[test]
    fn test_check_achievement_eligibility() {
        let env = setup();
        let address = Address::generate(&env);

        // Not eligible initially
        assert_eq!(check_achievement_eligibility(&env, address.clone(), 1), false);

        // Complete first task
        update_reputation(&env, address.clone(), ReputationEvent::TaskCompleted, 1);

        // Now eligible for "First Steps"
        assert_eq!(check_achievement_eligibility(&env, address, 1), true);
    }

    #[test]
    fn test_achievement_adds_reputation_points() {
        let env = setup();
        let address = Address::generate(&env);

        // Complete first task (10 points)
        update_reputation(&env, address.clone(), ReputationEvent::TaskCompleted, 1);

        let profile_before = get_reputation(&env, address.clone());
        let score_before = profile_before.score;

        // Award achievement (adds 10 points for "First Steps")
        award_achievement(&env, address.clone(), 1);

        let profile_after = get_reputation(&env, address);
        assert_eq!(profile_after.score, score_before + 10);
    }

    // ============ Leaderboard Tests ============

    #[test]
    fn test_update_leaderboard() {
        let env = setup();
        let guild_id = 1u64;
        let address1 = Address::generate(&env);
        let address2 = Address::generate(&env);
        let address3 = Address::generate(&env);

        // Give contributors different scores
        update_reputation(&env, address1.clone(), ReputationEvent::TaskCompleted, 5); // 50
        update_reputation(&env, address2.clone(), ReputationEvent::TaskCompleted, 10); // 50 (complexity capped at 5, so 50)
        update_reputation(&env, address3.clone(), ReputationEvent::TaskCompleted, 3); // 30

        // Update leaderboard
        update_guild_leaderboard(&env, guild_id, &address1);
        update_guild_leaderboard(&env, guild_id, &address2);
        update_guild_leaderboard(&env, guild_id, &address3);

        // Get top contributors
        let top = get_top_contributors_for_guild(&env, guild_id, 3);

        assert_eq!(top.len(), 3);
        // Should be sorted by score (descending)
        assert_eq!(top.get(0).unwrap(), address1); // or address2, both have 50
        assert_eq!(top.get(2).unwrap(), address3); // Lowest score
    }

    #[test]
    fn test_leaderboard_limit() {
        let env = setup();
        let guild_id = 1u64;

        // Create 5 contributors
        for i in 0..5 {
            let addr = Address::generate(&env);
            update_reputation(&env, addr.clone(), ReputationEvent::TaskCompleted, (i + 1) as u32);
            update_guild_leaderboard(&env, guild_id, &addr);
        }

        // Get top 3
        let top = get_top_contributors_for_guild(&env, guild_id, 3);
        assert_eq!(top.len(), 3);
    }

    // ============ Integration Tests ============

    #[test]
    fn test_full_contributor_lifecycle() {
        let env = setup();
        let address = Address::generate(&env);

        // Start as new contributor
        initialize_profile(&env, address.clone());
        assert_eq!(get_tier(&env, address.clone()), ReputationTier::Bronze);

        // Complete 10 tasks
        for _ in 0..10 {
            update_reputation(&env, address.clone(), ReputationEvent::TaskCompleted, 3);
        }

        // Should now be Silver tier with 300 points
        assert_eq!(get_tier(&env, address.clone()), ReputationTier::Silver);

        let profile = get_reputation(&env, address.clone());
        assert_eq!(profile.tasks_completed, 10);
        assert_eq!(profile.score, 300);

        // Award achievement for completing 10 tasks (ID 2: "Task Veteran")
        let awarded = award_achievement(&env, address.clone(), 2);
        assert_eq!(awarded, true);

        // Check total achievements
        let achievements = get_achievements(&env, address);
        assert_eq!(achievements.len(), 1);
    }

    #[test]
    fn test_reputation_with_mixed_events() {
        let env = setup();
        let address = Address::generate(&env);

        // Complete 5 tasks
        for _ in 0..5 {
            update_reputation(&env, address.clone(), ReputationEvent::TaskCompleted, 2);
        }

        // Complete 2 milestones
        update_reputation(&env, address.clone(), ReputationEvent::MilestoneAchieved, 3);
        update_reputation(&env, address.clone(), ReputationEvent::MilestoneAchieved, 4);

        // Win a dispute
        update_reputation(&env, address.clone(), ReputationEvent::DisputeWon, 0);

        // Fail 1 task
        update_reputation(&env, address.clone(), ReputationEvent::TaskFailed, 0);

        let profile = get_reputation(&env, address);

        // Verify tracking
        assert_eq!(profile.tasks_completed, 5);
        assert_eq!(profile.tasks_failed, 1);
        assert_eq!(profile.milestones_completed, 2);
        assert_eq!(profile.disputes_won, 1);

        // Calculate expected score: (5 * 20) + (3 * 20) + (4 * 20) + 5 - 10 = 100 + 60 + 80 + 5 - 10 = 235
        assert_eq!(profile.score, 235);

        // Success rate: 5 successes / 6 total tasks = 83%
        assert_eq!(profile.success_rate, 83);
    }
}
