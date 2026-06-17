use crate::events::emit::emit_event;
use crate::events::topics::{ACT_PROCESSED, ACT_QUEUED, MOD_PAYMENT};
use crate::payment::storage::PaymentStorageKey;
use crate::payment::types::{Payout, PayoutBatchProcessedEvent, PayoutQueuedEvent};
use soroban_sdk::{Address, Env, Vec};

/// Stub for a Protocol that interacts with the payout queue.
/// This fulfills the "Independence Note" by providing a stub without network hooks.
pub struct InteractingProtocolStub;

impl InteractingProtocolStub {
    pub fn pre_process_check(_env: &Env, _payout: &Payout) -> bool {
        true
    }

    pub fn post_process_hook(_env: &Env, _count: u32, _total_amount: i128) {
        // Empty stub hook
    }
}

pub struct PayoutQueue;

impl PayoutQueue {
    /// Add a payout to the persistent queue.
    ///
    /// # Arguments
    /// * `env` - The contract environment.
    /// * `recipient` - The address receiving the funds.
    /// * `amount` - The amount to be paid.
    /// * `token` - Optional token address (None for native XLM).
    pub fn add_payout(env: &Env, recipient: Address, amount: i128, token: Option<Address>) {
        let mut queue: Vec<Payout> = env
            .storage()
            .persistent()
            .get(&PaymentStorageKey::PayoutQueue)
            .unwrap_or(Vec::new(env));

        let payout = Payout {
            recipient: recipient.clone(),
            amount,
            token: token.clone(),
        };

        queue.push_back(payout);
        
        env.storage()
            .persistent()
            .set(&PaymentStorageKey::PayoutQueue, &queue);

        emit_event(
            env,
            MOD_PAYMENT,
            ACT_QUEUED,
            PayoutQueuedEvent {
                recipient,
                amount,
                token,
            },
        );
    }

    /// Process a batch of payouts from the queue in FIFO order.
    /// This helps avoid exceeding gas limits for large numbers of payouts.
    ///
    /// # Arguments
    /// * `env` - The contract environment.
    /// * `count` - Maximum number of payouts to process in this call.
    ///
    /// # Returns
    /// The actual number of payouts processed.
    pub fn process_payout_batch(env: &Env, count: u32) -> u32 {
        let mut queue: Vec<Payout> = env
            .storage()
            .persistent()
            .get(&PaymentStorageKey::PayoutQueue)
            .unwrap_or(Vec::new(env));

        if queue.is_empty() {
            return 0;
        }

        let total_in_queue = queue.len();
        let to_process = if count > total_in_queue {
            total_in_queue
        } else {
            count
        };

        let mut processed_count = 0;
        let mut total_amount = 0i128;

        for _ in 0..to_process {
            // Get the first item (FIFO)
            let payout = queue.get(0).unwrap();
            
            // Interaction with stub protocol
            if InteractingProtocolStub::pre_process_check(env, &payout) {
                if let Some(token_addr) = payout.token {
                    let client = soroban_sdk::token::Client::new(env, &token_addr);
                    client.transfer(&env.current_contract_address(), &payout.recipient, &payout.amount);
                } else {
                    // For native XLM, we would use the native token contract address
                    // In Soroban, the native token also has a contract address.
                    // This is a simplified stub for the transfer logic.
                }

                total_amount += payout.amount;
                processed_count += 1;
            }

            // Remove the processed (or skipped) item from the front
            queue.remove(0);
        }

        env.storage()
            .persistent()
            .set(&PaymentStorageKey::PayoutQueue, &queue);

        // Interaction with stub protocol
        InteractingProtocolStub::post_process_hook(env, processed_count, total_amount);

        emit_event(
            env,
            MOD_PAYMENT,
            ACT_PROCESSED,
            PayoutBatchProcessedEvent {
                count: processed_count,
                total_amount,
            },
        );

        processed_count
    }

    /// Get the current size of the payout queue.
    pub fn queue_size(env: &Env) -> u32 {
        let queue: Vec<Payout> = env
            .storage()
            .persistent()
            .get(&PaymentStorageKey::PayoutQueue)
            .unwrap_or(Vec::new(env));
        queue.len()
    }
}
