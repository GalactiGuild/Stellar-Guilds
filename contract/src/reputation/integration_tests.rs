#[cfg(test)]
mod integration_tests {
    use crate::reputation::types::{ReputationEvent, ReputationTier};
    use crate::reputation::{
        get_reputation, get_tier, initialize_profile, initialize_reputation_system,
        update_reputation, update_guild_leaderboard, get_top_contributors_for_guild,
        award_achievement, check_achievement_eligibility,
    };
    use soroban_sdk::testutils::Address as _;
    use soroban_sdk::{Address, Env};

    /// Test integration between bounty completion and reputation updates
    #[test]
    fn test_bounty_completion_reputation_flow() {
        let env = Env::default();
        env.budget().reset_unlimited();
        initialize_reputation_system(&env);

        let contributor = Address::generate(&env);
        let guild_id = 1u64;

        // Simulate bounty workflow:
        // 1. Contributor claims bounty
        // 2. Submits work
        // 3. Work is approved
        // 4. Reputation is updated

        // Complete a bounty (complexity 3)
        update_reputation(
            &env,
            contributor.clone(),
            ReputationEvent::TaskCompleted,
            3,
        );

        let profile = get_reputation(&env, contributor.clone());
        assert_eq!(profile.tasks_completed, 1);
        assert_eq!(profile.score, 30); // 10 * 3

        // Update guild leaderboard
        update_guild_leaderboard(&env, guild_id, &contributor);

        // Verify on leaderboard
        let top = get_top_contributors_for_guild(&env, guild_id, 10);
        assert_eq!(top.len(), 1);
        assert_eq!(top.get(0).unwrap(), contributor);
    }

    /// Test integration between milestone completion and reputation updates
    #[test]
    fn test_milestone_completion_reputation_flow() {
        let env = Env::default();
        env.budget().reset_unlimited();
        initialize_reputation_system(&env);

        let contributor = Address::generate(&env);
        let guild_id = 1u64;

        // Simulate milestone workflow:
        // 1. Project created with milestones
        // 2. Contributor completes milestone
        // 3. Guild admin approves
        // 4. Reputation is updated

        // Complete a significant milestone (significance 5)
        update_reputation(
            &env,
            contributor.clone(),
            ReputationEvent::MilestoneAchieved,
            5,
        );

        let profile = get_reputation(&env, contributor.clone());
        assert_eq!(profile.milestones_completed, 1);
        assert_eq!(profile.score, 100); // 20 * 5

        // Update leaderboard
        update_guild_leaderboard(&env, guild_id, &contributor);
    }

    /// Test combined bounty and milestone reputation flow
    #[test]
    fn test_combined_bounty_milestone_flow() {
        let env = Env::default();
        env.budget().reset_unlimited();
        initialize_reputation_system(&env);

        let contributor = Address::generate(&env);
        let guild_id = 1u64;

        // Complete 5 bounties
        for i in 1..=5 {
            update_reputation(
                &env,
                contributor.clone(),
                ReputationEvent::TaskCompleted,
                i,
            );
        }

        // Complete 2 milestones
        update_reputation(
            &env,
            contributor.clone(),
            ReputationEvent::MilestoneAchieved,
            3,
        );
        update_reputation(
            &env,
            contributor.clone(),
            ReputationEvent::MilestoneAchieved,
            4,
        );

        let profile = get_reputation(&env, contributor.clone());

        // Tasks: 10 + 20 + 30 + 40 + 50 = 150
        // Milestones: 60 + 80 = 140
        // Total: 290
        assert_eq!(profile.score, 290);
        assert_eq!(profile.tasks_completed, 5);
        assert_eq!(profile.milestones_completed, 2);
        assert_eq!(get_tier(&env, contributor.clone()), ReputationTier::Silver);

        // Update leaderboard
        update_guild_leaderboard(&env, guild_id, &contributor);
    }

    /// Test dispute resolution impact on reputation
    #[test]
    fn test_dispute_resolution_flow() {
        let env = Env::default();
        env.budget().reset_unlimited();
        initialize_reputation_system(&env);

        let contributor = Address::generate(&env);

        // Build up some reputation first
        for _ in 0..5 {
            update_reputation(
                &env,
                contributor.clone(),
                ReputationEvent::TaskCompleted,
                3,
            );
        }

        let profile_before = get_reputation(&env, contributor.clone());
        assert_eq!(profile_before.score, 150);

        // Simulate dispute - contributor wins
        update_reputation(&env, contributor.clone(), ReputationEvent::DisputeWon, 0);

        let profile_after_win = get_reputation(&env, contributor.clone());
        assert_eq!(profile_after_win.score, 155); // +5
        assert_eq!(profile_after_win.disputes_won, 1);

        // Simulate another dispute - contributor loses
        update_reputation(&env, contributor.clone(), ReputationEvent::DisputeLost, 0);

        let profile_after_loss = get_reputation(&env, contributor.clone());
        assert_eq!(profile_after_loss.score, 135); // -20
        assert_eq!(profile_after_loss.disputes_lost, 1);
    }

    /// Test task failure impact on success rate and reputation
    #[test]
    fn test_task_failure_impact() {
        let env = Env::default();
        env.budget().reset_unlimited();
        initialize_reputation_system(&env);

        let contributor = Address::generate(&env);
        let guild_id = 1u64;

        // Complete 9 tasks successfully
        for _ in 0..9 {
            update_reputation(
                &env,
                contributor.clone(),
                ReputationEvent::TaskCompleted,
                3,
            );
        }

        let profile_before_failure = get_reputation(&env, contributor.clone());
        assert_eq!(profile_before_failure.tasks_completed, 9);
        assert_eq!(profile_before_failure.success_rate, 100);

        // Fail 1 task
        update_reputation(&env, contributor.clone(), ReputationEvent::TaskFailed, 0);

        let profile_after_failure = get_reputation(&env, contributor.clone());
        assert_eq!(profile_after_failure.tasks_completed, 9);
        assert_eq!(profile_after_failure.tasks_failed, 1);
        assert_eq!(profile_after_failure.success_rate, 90); // 9/10 = 90%

        // Update leaderboard
        update_guild_leaderboard(&env, guild_id, &contributor);
    }

    /// Test achievement auto-award based on task completion
    #[test]
    fn test_achievement_award_on_task_milestones() {
        let env = Env::default();
        env.budget().reset_unlimited();
        initialize_reputation_system(&env);

        let contributor = Address::generate(&env);

        // Complete first task - eligible for "First Steps" (achievement ID 1)
        update_reputation(
            &env,
            contributor.clone(),
            ReputationEvent::TaskCompleted,
            1,
        );

        assert_eq!(
            check_achievement_eligibility(&env, contributor.clone(), 1),
            true
        );

        // Award the achievement
        let awarded = award_achievement(&env, contributor.clone(), 1);
        assert_eq!(awarded, true);

        let profile = get_reputation(&env, contributor.clone());
        assert_eq!(profile.achievements.len(), 1);

        // Continue to complete 9 more tasks (total 10) - eligible for "Task Veteran" (achievement ID 2)
        for _ in 0..9 {
            update_reputation(
                &env,
                contributor.clone(),
                ReputationEvent::TaskCompleted,
                2,
            );
        }

        assert_eq!(
            check_achievement_eligibility(&env, contributor.clone(), 2),
            true
        );

        // Award "Task Veteran"
        let awarded = award_achievement(&env, contributor.clone(), 2);
        assert_eq!(awarded, true);

        let profile = get_reputation(&env, contributor);
        assert_eq!(profile.achievements.len(), 2);
    }

    /// Test multi-guild leaderboard tracking
    #[test]
    fn test_multi_guild_leaderboard() {
        let env = Env::default();
        env.budget().reset_unlimited();
        initialize_reputation_system(&env);

        let contributor1 = Address::generate(&env);
        let contributor2 = Address::generate(&env);
        let contributor3 = Address::generate(&env);

        let guild_1 = 1u64;
        let guild_2 = 2u64;

        // Contributor 1 works in Guild 1
        update_reputation(
            &env,
            contributor1.clone(),
            ReputationEvent::TaskCompleted,
            5,
        ); // 50 points
        update_guild_leaderboard(&env, guild_1, &contributor1);

        // Contributor 2 works in Guild 1
        update_reputation(
            &env,
            contributor2.clone(),
            ReputationEvent::TaskCompleted,
            3,
        ); // 30 points
        update_guild_leaderboard(&env, guild_1, &contributor2);

        // Contributor 3 works in Guild 2
        update_reputation(
            &env,
            contributor3.clone(),
            ReputationEvent::TaskCompleted,
            4,
        ); // 40 points
        update_guild_leaderboard(&env, guild_2, &contributor3);

        // Check Guild 1 leaderboard
        let guild1_top = get_top_contributors_for_guild(&env, guild_1, 10);
        assert_eq!(guild1_top.len(), 2);

        // Check Guild 2 leaderboard
        let guild2_top = get_top_contributors_for_guild(&env, guild_2, 10);
        assert_eq!(guild2_top.len(), 1);
        assert_eq!(guild2_top.get(0).unwrap(), contributor3);
    }

    /// Test reputation tier upgrade triggers during bounty completion
    #[test]
    fn test_tier_upgrade_during_bounty_completion() {
        let env = Env::default();
        env.budget().reset_unlimited();
        initialize_reputation_system(&env);

        let contributor = Address::generate(&env);

        // Start at Bronze
        assert_eq!(get_tier(&env, contributor.clone()), ReputationTier::Bronze);

        // Complete bounties to reach Silver (100 points)
        for _ in 0..4 {
            update_reputation(
                &env,
                contributor.clone(),
                ReputationEvent::TaskCompleted,
                5,
            ); // 50 each
        }

        // Should now be Silver
        assert_eq!(get_tier(&env, contributor.clone()), ReputationTier::Silver);

        // Complete more bounties to reach Gold (500 points)
        for _ in 0..16 {
            update_reputation(
                &env,
                contributor.clone(),
                ReputationEvent::TaskCompleted,
                5,
            );
        }

        // Should now be Gold
        assert_eq!(get_tier(&env, contributor), ReputationTier::Gold);
    }

    /// Test contributor progress tracking across multiple projects
    #[test]
    fn test_contributor_progress_tracking() {
        let env = Env::default();
        env.budget().reset_unlimited();
        initialize_reputation_system(&env);

        let contributor = Address::generate(&env);
        let guild_id = 1u64;

        // Project 1: 3 bounties
        for i in 1..=3 {
            update_reputation(
                &env,
                contributor.clone(),
                ReputationEvent::TaskCompleted,
                i,
            );
        }

        // Project 2: 2 milestones
        for i in 1..=2 {
            update_reputation(
                &env,
                contributor.clone(),
                ReputationEvent::MilestoneAchieved,
                i,
            );
        }

        // Project 3: 2 more bounties
        for i in 1..=2 {
            update_reputation(
                &env,
                contributor.clone(),
                ReputationEvent::TaskCompleted,
                i + 3,
            );
        }

        let profile = get_reputation(&env, contributor.clone());

        // Verify tracking
        assert_eq!(profile.tasks_completed, 5);
        assert_eq!(profile.milestones_completed, 2);
        assert_eq!(profile.success_rate, 100);

        // Update leaderboard
        update_guild_leaderboard(&env, guild_id, &contributor);

        // Verify appears on leaderboard
        let top = get_top_contributors_for_guild(&env, guild_id, 10);
        assert!(top.len() > 0);
    }

    /// Test perfect record achievement eligibility
    #[test]
    fn test_perfect_record_achievement() {
        let env = Env::default();
        env.budget().reset_unlimited();
        initialize_reputation_system(&env);

        let contributor = Address::generate(&env);

        // Complete 10 tasks with 100% success rate
        for _ in 0..10 {
            update_reputation(
                &env,
                contributor.clone(),
                ReputationEvent::TaskCompleted,
                2,
            );
        }

        let profile = get_reputation(&env, contributor.clone());
        assert_eq!(profile.tasks_completed, 10);
        assert_eq!(profile.success_rate, 100);

        // Should be eligible for "Perfect Record" (achievement ID 4)
        assert_eq!(
            check_achievement_eligibility(&env, contributor, 4),
            true
        );
    }

    /// Test reputation consistency across multiple operations
    #[test]
    fn test_reputation_consistency() {
        let env = Env::default();
        env.budget().reset_unlimited();
        initialize_reputation_system(&env);

        let contributor = Address::generate(&env);
        let guild_id = 1u64;

        // Perform various operations
        for _ in 0..5 {
            update_reputation(
                &env,
                contributor.clone(),
                ReputationEvent::TaskCompleted,
                3,
            );
            update_guild_leaderboard(&env, guild_id, &contributor);
        }

        let profile1 = get_reputation(&env, contributor.clone());

        // Perform more operations
        for _ in 0..3 {
            update_reputation(
                &env,
                contributor.clone(),
                ReputationEvent::MilestoneAchieved,
                2,
            );
            update_guild_leaderboard(&env, guild_id, &contributor);
        }

        let profile2 = get_reputation(&env, contributor.clone());

        // Verify consistency
        assert!(profile2.score > profile1.score);
        assert_eq!(profile2.tasks_completed, profile1.tasks_completed);
        assert_eq!(profile2.milestones_completed, 3);
    }
}
