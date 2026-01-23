use crate::bounty::types::Bounty;
use soroban_sdk::{symbol_short, Env, Map, Symbol, Vec};

// Storage keys
const BOUNTIES_KEY: Symbol = symbol_short!("bounties");
const BOUNTY_CNT_KEY: Symbol = symbol_short!("b_cnt");
const GUILD_BOUNTIES_KEY: Symbol = symbol_short!("g_bounties");

/// Initialize bounty storage
pub fn initialize(env: &Env) {
    if !env.storage().persistent().has(&BOUNTY_CNT_KEY) {
        env.storage().persistent().set(&BOUNTY_CNT_KEY, &0u64);
        initialize_milestone_storage(&env);
    }
}

/// Get the next bounty ID and increment
pub fn get_next_bounty_id(env: &Env) -> u64 {
    let counter: u64 = env
        .storage()
        .persistent()
        .get(&BOUNTY_CNT_KEY)
        .unwrap_or(0u64);

    let next_id = counter + 1;
    env.storage().persistent().set(&BOUNTY_CNT_KEY, &next_id);

    next_id
}

/// Store a bounty and update the guild index
pub fn store_bounty(env: &Env, bounty: &Bounty) {
    // 1. Save to main bounties map
    let mut bounties: Map<u64, Bounty> = env
        .storage()
        .persistent()
        .get(&BOUNTIES_KEY)
        .unwrap_or_else(|| Map::new(env));

    let is_new = !bounties.contains_key(bounty.id);
    bounties.set(bounty.id, bounty.clone());
    env.storage().persistent().set(&BOUNTIES_KEY, &bounties);

    // 2. Update guild index if it's a new bounty
    if is_new {
        let mut guild_bounties: Map<u64, Vec<u64>> = env
            .storage()
            .persistent()
            .get(&GUILD_BOUNTIES_KEY)
            .unwrap_or_else(|| Map::new(env));

        let mut list = guild_bounties
            .get(bounty.guild_id)
            .unwrap_or_else(|| Vec::new(env));
        
        list.push_back(bounty.id);
        guild_bounties.set(bounty.guild_id, list);
        env.storage().persistent().set(&GUILD_BOUNTIES_KEY, &guild_bounties);
    }
}

/// Get a bounty by ID
pub fn get_bounty(env: &Env, bounty_id: u64) -> Option<Bounty> {
    let bounties: Map<u64, Bounty> = env
        .storage()
        .persistent()
        .get(&BOUNTIES_KEY)
        .unwrap_or_else(|| Map::new(env));

    bounties.get(bounty_id)
}

/// Get all bounties for a guild
pub fn get_guild_bounties(env: &Env, guild_id: u64) -> Vec<Bounty> {
    let guild_bounties: Map<u64, Vec<u64>> = env
        .storage()
        .persistent()
        .get(&GUILD_BOUNTIES_KEY)
        .unwrap_or_else(|| Map::new(env));

    let bounty_ids = guild_bounties
        .get(guild_id)
        .unwrap_or_else(|| Vec::new(env));

    let bounties_map: Map<u64, Bounty> = env
        .storage()
        .persistent()
        .get(&BOUNTIES_KEY)
        .unwrap_or_else(|| Map::new(env));

    let mut result = Vec::new(env);
    for id in bounty_ids.iter() {
        if let Some(b) = bounties_map.get(id) {
            result.push_back(b);
        }
    }
    result
}

    // ============ Milestone Functions ============

    /// Create a new milestone-based project.
    ///
    /// Extended signature:
    /// - `treasury_id`: treasury to fund milestone payments from
    /// - `token`: asset used for payments (None for XLM-style)
    /// - `is_sequential`: true = milestones must be completed in order
    pub fn create_project(
        env: Env,
        guild_id: u64,
        contributor: Address,
        milestones: Vec<MilestoneInput>,
        total_amount: i128,
        treasury_id: u64,
        token: Option<Address>,
        is_sequential: bool,
    ) -> u64 {
        milestone_create_project(
            &env,
            guild_id,
            contributor,
            milestones,
            total_amount,
            treasury_id,
            token,
            is_sequential,
        )
    }

    /// Add a milestone to an existing project (guild admin only).
    pub fn add_milestone(
        env: Env,
        project_id: u64,
        title: String,
        description: String,
        amount: i128,
        deadline: u64,
        caller: Address,
    ) -> u64 {
        milestone_add_milestone(
            &env,
            project_id,
            title,
            description,
            amount,
            deadline,
            caller,
        )
    }

    /// Start work on a milestone (project contributor only).
    pub fn start_milestone(env: Env, milestone_id: u64, contributor: Address) -> bool {
        milestone_start_milestone(&env, milestone_id, contributor)
    }

    /// Submit proof of work for a milestone.
    pub fn submit_milestone(env: Env, milestone_id: u64, proof_url: String) -> bool {
        milestone_submit_milestone(&env, milestone_id, proof_url)
    }

    /// Approve a submitted milestone (guild admin only).
    pub fn approve_milestone(env: Env, milestone_id: u64, approver: Address) -> bool {
        milestone_approve_milestone(&env, milestone_id, approver)
    }

    /// Reject a submitted milestone with a reason (guild admin only).
    pub fn reject_milestone(
        env: Env,
        milestone_id: u64,
        approver: Address,
        reason: String,
    ) -> bool {
        milestone_reject_milestone(&env, milestone_id, approver, reason)
    }

    /// Get project progress as (completed_milestones, total_milestones, percentage).
    pub fn get_project_progress(env: Env, project_id: u64) -> (u32, u32, u32) {
        milestone_get_project_progress(&env, project_id)
    }

    /// Get a milestone by ID.
    pub fn get_milestone(env: Env, milestone_id: u64) -> Milestone {
        milestone_get_milestone(&env, milestone_id)
    }

    /// Release payment for an approved milestone.
    pub fn release_milestone_payment(env: Env, milestone_id: u64) -> bool {
        milestone_release_milestone_payment(&env, milestone_id)
    }

    /// Extend a milestone deadline (guild admin only).
    pub fn extend_milestone_deadline(
        env: Env,
        milestone_id: u64,
        new_deadline: u64,
        caller: Address,
    ) -> bool {
        milestone_extend_milestone_deadline(&env, milestone_id, new_deadline, caller)
    }

    /// Cancel a project (guild admin only).
    pub fn cancel_project(env: Env, project_id: u64, caller: Address) -> bool {
        milestone_cancel_project(&env, project_id, caller)
    }