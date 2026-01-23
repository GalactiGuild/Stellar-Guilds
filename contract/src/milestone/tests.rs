use crate::{
    StellarGuildsContract,
    StellarGuildsContractClient,
};
use crate::guild::types::Role;
use crate::milestone::storage::{
    initialize_milestone_storage,
    get_project_milestone_ids,
};
use crate::milestone::tracker;
use crate::milestone::types::{MilestoneInput, MilestoneStatus, ProjectStatus};
use crate::treasury::get_balance as treasury_get_balance;

use soroban_sdk::{
    testutils::{Address as _, Ledger},
    Address, Env, String, Vec,
};

fn setup_client() -> (Env, StellarGuildsContractClient, Address, Address, Address, Address) {
    let env = Env::default();
    env.budget().reset_unlimited();

    let owner = Address::random(&env);
    let admin = Address::random(&env);
    let contributor = Address::random(&env);
    let funder = Address::random(&env);

    let contract_id = env.register_contract(None, StellarGuildsContract);
    let client = StellarGuildsContractClient::new(&env, &contract_id);
    client.initialize();

    (env, client, owner, admin, contributor, funder)
}

fn create_token(env: &Env, issuer: &Address) -> (Address, soroban_sdk::token::Client<'static>) {
    let token_id = env.register_stellar_asset_contract(issuer.clone());
    let token_client = soroban_sdk::token::Client::new(env, &token_id);
    (token_id, token_client)
}

fn setup_guild_treasury_and_funds(
    env: &Env,
    client: &StellarGuildsContractClient,
    owner: &Address,
    admin: &Address,
    funder: &Address,
) -> (u64, u64, Address, soroban_sdk::token::Client<'static>) {
    owner.mock_all_auths();
    admin.mock_all_auths();
    funder.mock_all_auths();

    let name = String::from_str(env, "Dev Guild");
    let desc = String::from_str(env, "Developers");
    let guild_id = client.create_guild(&name, &desc, owner);

    // Add admin
    client.add_member(&guild_id, admin, &Role::Admin, owner);

    // Create token and mint to funder
    let (token_id, token_client) = create_token(env, funder);
    token_client.mint(funder, &1_000_000);

    // Initialize treasury with owner as signer
    let mut signers: Vec<Address> = Vec::new(env);
    signers.push_back(owner.clone());
    let approval_threshold: u32 = 1;
    let high_value_threshold: i128 = 1_000_000;
    let treasury_id = client.initialize_treasury(
        &guild_id,
        owner,
        &signers,
        &approval_threshold,
        &high_value_threshold,
    );

    // Deposit tokens into treasury
    let deposit_amount: i128 = 500_000;
    client.deposit(&treasury_id, funder, &deposit_amount, &Some(token_id.clone()));

    (guild_id, treasury_id, token_id, token_client)
}

#[test]
fn test_sequential_milestone_flow_releases_payments() {
    let (env, client, owner, admin, contributor, funder) = setup_client();
    let (guild_id, treasury_id, token_id, token_client) =
        setup_guild_treasury_and_funds(&env, &client, &owner, &admin, &funder);

    // Initialize milestone storage explicitly (not done in initialize yet)
    initialize_milestone_storage(&env);

    contributor.mock_all_auths();

    let now = env.ledger().timestamp();
    let mut inputs: Vec<MilestoneInput> = Vec::new(&env);

    inputs.push_back(MilestoneInput {
        title: String::from_str(&env, "Phase 1"),
        description: String::from_str(&env, "Initial phase"),
        payment_amount: 100_000,
        deadline: now + 86400,
    });
    inputs.push_back(MilestoneInput {
        title: String::from_str(&env, "Phase 2"),
        description: String::from_str(&env, "Second phase"),
        payment_amount: 200_000,
        deadline: now + 2 * 86400,
    });

    let total_amount: i128 = 300_000;

    let project_id = tracker::create_project(
        &env,
        guild_id,
        contributor.clone(),
        inputs,
        total_amount,
        treasury_id,
        Some(token_id.clone()),
        true, // sequential
    );

    // Initially no milestones completed
    let (completed, total, pct) = tracker::get_project_progress(&env, project_id);
    assert_eq!(total, 2);
    assert_eq!(completed, 0);
    assert_eq!(pct, 0);

    // Get milestone IDs
    let milestone_ids = get_project_milestone_ids(&env, project_id);
    assert_eq!(milestone_ids.len(), 2);
    let m1_id = milestone_ids.get_unchecked(0);
    let m2_id = milestone_ids.get_unchecked(1);

    // Start and complete first milestone
    tracker::start_milestone(&env, m1_id, contributor.clone());
    tracker::submit_milestone(&env, m1_id, String::from_str(&env, "http://proof/1"));

    admin.mock_all_auths();
    tracker::approve_milestone(&env, m1_id, admin.clone());

    // Payment for first milestone should be released to contributor
    let contributor_balance = token_client.balance(&contributor);
    assert_eq!(contributor_balance, 100_000);

    // Treasury balance should decrease by same amount
    let treasury_balance = treasury_get_balance(&env, treasury_id, Some(token_id.clone()));
    assert_eq!(treasury_balance, 500_000 - 100_000);

    // Project progress should show 1/2 milestones completed
    let (completed, total, pct) = tracker::get_project_progress(&env, project_id);
    assert_eq!(completed, 1);
    assert_eq!(total, 2);
    assert_eq!(pct, 50);

    // Second milestone cannot be started before first is approved (already approved here),
    // so starting now should succeed
    tracker::start_milestone(&env, m2_id, contributor.clone());
    tracker::submit_milestone(&env, m2_id, String::from_str(&env, "http://proof/2"));
    tracker::approve_milestone(&env, m2_id, admin.clone());

    // Full payment released
    let contributor_balance_after = token_client.balance(&contributor);
    assert_eq!(contributor_balance_after, 300_000);

    // Project should be marked completed
    let project = crate::milestone::storage::get_project(&env, project_id).unwrap();
    assert_eq!(project.status, ProjectStatus::Completed);
}

#[test]
#[should_panic(expected = "previous milestone not completed")]
fn test_sequential_prevents_out_of_order_start() {
    let (env, client, owner, admin, contributor, funder) = setup_client();
    let (guild_id, treasury_id, token_id, _token_client) =
        setup_guild_treasury_and_funds(&env, &client, &owner, &admin, &funder);

    initialize_milestone_storage(&env);

    contributor.mock_all_auths();

    let now = env.ledger().timestamp();
    let mut inputs: Vec<MilestoneInput> = Vec::new(&env);

    inputs.push_back(MilestoneInput {
        title: String::from_str(&env, "M1"),
        description: String::from_str(&env, ""),
        payment_amount: 50_000,
        deadline: now + 86400,
    });
    inputs.push_back(MilestoneInput {
        title: String::from_str(&env, "M2"),
        description: String::from_str(&env, ""),
        payment_amount: 50_000,
        deadline: now + 2 * 86400,
    });

    let project_id = tracker::create_project(
        &env,
        guild_id,
        contributor.clone(),
        inputs,
        100_000,
        treasury_id,
        Some(token_id.clone()),
        true,
    );

    let ids = get_project_milestone_ids(&env, project_id);
    let m2_id = ids.get_unchecked(1);

    // Attempt to start second milestone before first is completed should panic
    tracker::start_milestone(&env, m2_id, contributor.clone());
}

#[test]
fn test_parallel_allows_out_of_order_completion() {
    let (env, client, owner, admin, contributor, funder) = setup_client();
    let (guild_id, treasury_id, token_id, token_client) =
        setup_guild_treasury_and_funds(&env, &client, &owner, &admin, &funder);

    initialize_milestone_storage(&env);

    contributor.mock_all_auths();

    let now = env.ledger().timestamp();
    let mut inputs: Vec<MilestoneInput> = Vec::new(&env);

    inputs.push_back(MilestoneInput {
        title: String::from_str(&env, "P1"),
        description: String::from_str(&env, ""),
        payment_amount: 50_000,
        deadline: now + 86400,
    });
    inputs.push_back(MilestoneInput {
        title: String::from_str(&env, "P2"),
        description: String::from_str(&env, ""),
        payment_amount: 75_000,
        deadline: now + 2 * 86400,
    });

    let total_amount = 125_000;

    let project_id = tracker::create_project(
        &env,
        guild_id,
        contributor.clone(),
        inputs,
        total_amount,
        treasury_id,
        Some(token_id.clone()),
        false, // parallel
    );

    let ids = get_project_milestone_ids(&env, project_id);
    let m1_id = ids.get_unchecked(0);
    let m2_id = ids.get_unchecked(1);

    // Start and complete second milestone first (allowed in parallel mode)
    tracker::start_milestone(&env, m2_id, contributor.clone());
    tracker::submit_milestone(&env, m2_id, String::from_str(&env, "http://proof/2"));

    admin.mock_all_auths();
    tracker::approve_milestone(&env, m2_id, admin.clone());

    // Contributor should receive payment for m2
    let balance_after_m2 = token_client.balance(&contributor);
    assert_eq!(balance_after_m2, 75_000);

    // Now complete m1
    tracker::start_milestone(&env, m1_id, contributor.clone());
    tracker::submit_milestone(&env, m1_id, String::from_str(&env, "http://proof/1"));
    tracker::approve_milestone(&env, m1_id, admin.clone());

    let final_balance = token_client.balance(&contributor);
    assert_eq!(final_balance, 125_000);
}

#[test]
#[should_panic(expected = "milestone expired")]
fn test_expired_milestone_cannot_be_started() {
    let (env, client, owner, admin, contributor, funder) = setup_client();
    let (guild_id, treasury_id, token_id, _token_client) =
        setup_guild_treasury_and_funds(&env, &client, &owner, &admin, &funder);

    initialize_milestone_storage(&env);

    contributor.mock_all_auths();

    let now = env.ledger().timestamp();
    let mut inputs: Vec<MilestoneInput> = Vec::new(&env);

    inputs.push_back(MilestoneInput {
        title: String::from_str(&env, "Expiring"),
        description: String::from_str(&env, ""),
        payment_amount: 10_000,
        deadline: now + 10,
    });

    let project_id = tracker::create_project(
        &env,
        guild_id,
        contributor.clone(),
        inputs,
        10_000,
        treasury_id,
        Some(token_id.clone()),
        true,
    );

    let ids = get_project_milestone_ids(&env, project_id);
    let m_id = ids.get_unchecked(0);

    // Move time past deadline
    env.ledger().set_timestamp(now + 20);

    // This should mark milestone as expired and panic
    tracker::start_milestone(&env, m_id, contributor.clone());
}

#[test]
fn test_extend_deadline_and_then_start() {
    let (env, client, owner, admin, contributor, funder) = setup_client();
    let (guild_id, treasury_id, token_id, _token_client) =
        setup_guild_treasury_and_funds(&env, &client, &owner, &admin, &funder);

    initialize_milestone_storage(&env);

    contributor.mock_all_auths();

    let now = env.ledger().timestamp();
    let mut inputs: Vec<MilestoneInput> = Vec::new(&env);

    inputs.push_back(MilestoneInput {
        title: String::from_str(&env, "Late"),
        description: String::from_str(&env, ""),
        payment_amount: 10_000,
        deadline: now + 10,
    });

    let project_id = tracker::create_project(
        &env,
        guild_id,
        contributor.clone(),
        inputs,
        10_000,
        treasury_id,
        Some(token_id.clone()),
        true,
    );

    let ids = get_project_milestone_ids(&env, project_id);
    let m_id = ids.get_unchecked(0);

    // Move time past original deadline
    env.ledger().set_timestamp(now + 20);

    // Admin extends deadline into the future
    admin.mock_all_auths();
    let new_deadline = now + 100;
    tracker::extend_milestone_deadline(&env, m_id, new_deadline, admin.clone());

    // Contributor can now start milestone without panic
    tracker::start_milestone(&env, m_id, contributor.clone());
}
