use super::*;
use crate::payment::queue::PayoutQueue;
use crate::payment::types::Payout;
use crate::StellarGuildsContract;
use crate::StellarGuildsContractClient;
use soroban_sdk::testutils::Address as _;
use soroban_sdk::{Address, Env, Vec};

#[test]
fn test_payout_queue_fifo_order() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, StellarGuildsContract);
    
    let recipient1 = Address::generate(&env);
    let recipient2 = Address::generate(&env);
    let recipient3 = Address::generate(&env);

    env.as_contract(&contract_id, || {
        // Add payouts
        PayoutQueue::add_payout(&env, recipient1.clone(), 100, None);
        PayoutQueue::add_payout(&env, recipient2.clone(), 200, None);
        PayoutQueue::add_payout(&env, recipient3.clone(), 300, None);

        assert_eq!(PayoutQueue::queue_size(&env), 3);

        // Process first payout (FIFO)
        let processed = PayoutQueue::process_payout_batch(&env, 1);
        assert_eq!(processed, 1);
        assert_eq!(PayoutQueue::queue_size(&env), 2);

        // Process remaining payouts
        let processed = PayoutQueue::process_payout_batch(&env, 10);
        assert_eq!(processed, 2);
        assert_eq!(PayoutQueue::queue_size(&env), 0);
    });
}

#[test]
fn test_payout_queue_batch_processing() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, StellarGuildsContract);
    
    let recipient = Address::generate(&env);

    env.as_contract(&contract_id, || {
        // Add 10 payouts
        for i in 0..10 {
            PayoutQueue::add_payout(&env, recipient.clone(), 100 + i as i128, None);
        }

        assert_eq!(PayoutQueue::queue_size(&env), 10);

        // Process in batches of 3
        assert_eq!(PayoutQueue::process_payout_batch(&env, 3), 3);
        assert_eq!(PayoutQueue::queue_size(&env), 7);

        assert_eq!(PayoutQueue::process_payout_batch(&env, 3), 3);
        assert_eq!(PayoutQueue::queue_size(&env), 4);

        assert_eq!(PayoutQueue::process_payout_batch(&env, 3), 3);
        assert_eq!(PayoutQueue::queue_size(&env), 1);

        assert_eq!(PayoutQueue::process_payout_batch(&env, 3), 1);
        assert_eq!(PayoutQueue::queue_size(&env), 0);
        
        assert_eq!(PayoutQueue::process_payout_batch(&env, 3), 0);
    });
}

#[test]
fn test_payout_queue_token_transfers() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, StellarGuildsContract);
    let admin = Address::generate(&env);
    let recipient = Address::generate(&env);
    
    // Register token contract
    let token_contract_id = env.register_stellar_asset_contract_v2(admin.clone());
    let token_addr = token_contract_id.address();
    let token_client = soroban_sdk::token::StellarAssetClient::new(&env, &token_addr);
    let token_query = soroban_sdk::token::TokenClient::new(&env, &token_addr);

    // Mint tokens to the main contract
    token_client.mint(&contract_id, &1000);

    env.as_contract(&contract_id, || {
        // Add payout with token
        PayoutQueue::add_payout(&env, recipient.clone(), 500, Some(token_addr.clone()));
        
        assert_eq!(PayoutQueue::queue_size(&env), 1);

        // Process payout
        PayoutQueue::process_payout_batch(&env, 1);
    });

    // Verify balance
    assert_eq!(token_query.balance(&recipient), 500);
    assert_eq!(token_query.balance(&contract_id), 500);
}
