/// Unified Event System for Cross-Contract Communication.
///
/// Provides centralized event emission, storage, and retrieval across all
/// platform contracts. Supports filtering, pagination, and subscriptions.

use crate::integration::types::{
    Event, EventFilter, EventType, IntegrationError, IntegrationResult, EventSubscription,
    DEFAULT_EVENT_LIMIT,
};
use soroban_sdk::{Address, Env, IntoVal, Map, Symbol, Vec};

/// Storage key for event storage.
pub const EVENTS_KEY: &str = "events";

/// Storage key for event sequence counter.
pub const EVENT_SEQUENCE_KEY: &str = "event_seq";

/// Storage key for event subscriptions.
pub const SUBSCRIPTIONS_KEY: &str = "event_subscriptions";

/// Generate a unique event ID.
pub fn create_event_id(env: &Env) -> u128 {
    let seq: u64 = env
        .storage()
        .instance()
        .get(&Symbol::new(env, EVENT_SEQUENCE_KEY))
        .unwrap_or(0);
    
    let new_seq = seq + 1;
    env.storage()
        .instance()
        .set(&Symbol::new(env, EVENT_SEQUENCE_KEY), &new_seq);
    
    // Combine timestamp and sequence for uniqueness
    ((env.ledger().timestamp() as u128) << 32) | (new_seq as u128)
}

/// Emit an event to the unified event system.
///
/// # Arguments
/// * `env` - The Soroban environment
/// * `event_type` - Type of event being emitted
/// * `contract_source` - Contract type that emitted the event
/// * `data` - Event data as a Symbol
///
/// # Returns
/// `true` if emission was successful
pub fn emit_event(
    env: &Env,
    event_type: EventType,
    contract_source: crate::integration::types::ContractType,
    data: Symbol,
) -> IntegrationResult<bool> {
    let event_id = create_event_id(env);
    
    let event = Event {
        event_type: event_type.clone(),
        contract_source: contract_source.clone(),
        timestamp: env.ledger().timestamp(),
        data,
        event_id,
    };
    
    // Get existing events or create new map
    let mut events: Map<u128, Event> = env
        .storage()
        .instance()
        .get(&Symbol::new(env, EVENTS_KEY))
        .unwrap_or_else(|| Map::new(env));
    
    // Check storage limit (simple implementation - in production would use more sophisticated storage)
    if events.len() >= 10000 {
        return Err(IntegrationError::EventStorageFull);
    }
    
    events.set(event_id, event);
    env.storage()
        .instance()
        .set(&Symbol::new(env, EVENTS_KEY), &events);
    
    // Notify subscribers (simplified - in production would trigger callbacks)
    notify_subscribers(env, &event_type, &contract_source);
    
    Ok(true)
}

/// Get events with optional filtering.
///
/// # Arguments
/// * `env` - The Soroban environment
/// * `filter` - Optional event filter
/// * `from_timestamp` - Start timestamp for filtering
/// * `limit` - Maximum number of events to return
///
/// # Returns
/// Vector of events matching the filter criteria
pub fn get_events(
    env: &Env,
    filter: Option<EventFilter>,
    from_timestamp: u64,
    limit: u32,
) -> Vec<Event> {
    let events: Map<u128, Event> = env
        .storage()
        .instance()
        .get(&Symbol::new(env, EVENTS_KEY))
        .unwrap_or_else(|| Map::new(env));
    
    let mut result = Vec::new(env);
    let effective_limit = if limit == 0 { DEFAULT_EVENT_LIMIT } else { limit };
    
    for event in events.values() {
        if result.len() >= effective_limit {
            break;
        }
        
        // Apply timestamp filter
        if event.timestamp < from_timestamp {
            continue;
        }
        
        // Apply optional filter
        if let Some(ref f) = filter {
            if let Some(ref event_type) = f.event_type {
                if &event.event_type != event_type {
                    continue;
                }
            }
            
            if let Some(ref contract_source) = f.contract_source {
                if &event.contract_source != contract_source {
                    continue;
                }
            }
            
            if event.timestamp < f.from_timestamp || event.timestamp > f.to_timestamp {
                continue;
            }
        }
        
        result.push_back(event);
    }
    
    result
}

/// Subscribe to specific event types.
///
/// # Arguments
/// * `env` - The Soroban environment
/// * `subscriber` - Address subscribing to events
/// * `event_types` - Vector of event types to subscribe to
///
/// # Returns
/// `true` if subscription was successful
pub fn subscribe_to_events(
    env: &Env,
    subscriber: &Address,
    event_types: Vec<EventType>,
) -> IntegrationResult<bool> {
    subscriber.require_auth();
    
    let mut subscriptions: Map<Address, EventSubscription> = env
        .storage()
        .instance()
        .get(&Symbol::new(env, SUBSCRIPTIONS_KEY))
        .unwrap_or_else(|| Map::new(env));
    
    let subscription = EventSubscription {
        subscriber: subscriber.clone(),
        event_types: event_types.clone(),
        subscribed_at: env.ledger().timestamp(),
    };
    
    subscriptions.set(subscriber.clone(), subscription);
    env.storage()
        .instance()
        .set(&Symbol::new(env, SUBSCRIPTIONS_KEY), &subscriptions);
    
    Ok(true)
}

/// Unsubscribe from events.
///
/// # Arguments
/// * `env` - The Soroban environment
/// * `subscriber` - Address to unsubscribe
///
/// # Returns
/// `true` if unsubscription was successful
pub fn unsubscribe_from_events(
    env: &Env,
    subscriber: &Address,
) -> IntegrationResult<bool> {
    subscriber.require_auth();
    
    let mut subscriptions: Map<Address, EventSubscription> = env
        .storage()
        .instance()
        .get(&Symbol::new(env, SUBSCRIPTIONS_KEY))
        .unwrap_or_else(|| Map::new(env));
    
    if !subscriptions.contains_key(subscriber.clone()) {
        return Err(IntegrationError::SubscriptionNotFound);
    }
    
    subscriptions.remove(subscriber.clone());
    env.storage()
        .instance()
        .set(&Symbol::new(env, SUBSCRIPTIONS_KEY), &subscriptions);
    
    Ok(true)
}

/// Notify subscribers of an event (internal helper).
/// In a production implementation, this would trigger external callbacks
/// or store notifications for retrieval.
fn notify_subscribers(
    env: &Env,
    event_type: &EventType,
    contract_source: &crate::integration::types::ContractType,
) {
    let subscriptions: Map<Address, EventSubscription> = env
        .storage()
        .instance()
        .get(&Symbol::new(env, SUBSCRIPTIONS_KEY))
        .unwrap_or_else(|| Map::new(env));
    
    // In production, this would queue notifications for retrieval
    // For now, we just validate that subscribers exist
    for subscription in subscriptions.values() {
        for subscribed_type in subscription.event_types.iter() {
            if &subscribed_type == event_type {
                // Subscriber found - in production would queue notification
                break;
            }
        }
    }
}

/// Get event by ID.
///
/// # Arguments
/// * `env` - The Soroban environment
/// * `event_id` - Unique event identifier
///
/// # Returns
/// The event if found
pub fn get_event_by_id(env: &Env, event_id: u128) -> IntegrationResult<Event> {
    let events: Map<u128, Event> = env
        .storage()
        .instance()
        .get(&Symbol::new(env, EVENTS_KEY))
        .unwrap_or_else(|| Map::new(env));
    
    events
        .get(event_id)
        .ok_or(IntegrationError::EventNotFound)
}

/// Get subscriber's event subscriptions.
///
/// # Arguments
/// * `env` - The Soroban environment
/// * `subscriber` - Address to lookup
///
/// # Returns
/// Event subscription if found
pub fn get_subscription(
    env: &Env,
    subscriber: &Address,
) -> IntegrationResult<EventSubscription> {
    let subscriptions: Map<Address, EventSubscription> = env
        .storage()
        .instance()
        .get(&Symbol::new(env, SUBSCRIPTIONS_KEY))
        .unwrap_or_else(|| Map::new(env));
    
    subscriptions
        .get(subscriber.clone())
        .ok_or(IntegrationError::SubscriptionNotFound)
}

/// Get total event count.
///
/// # Arguments
/// * `env` - The Soroban environment
///
/// # Returns
/// Total number of events stored
pub fn get_event_count(env: &Env) -> u64 {
    env.storage()
        .instance()
        .get(&Symbol::new(env, EVENT_SEQUENCE_KEY))
        .unwrap_or(0)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::integration::types::ContractType;
    use soroban_sdk::testutils::Address as _;

    fn setup() -> (Env, Address) {
        let env = Env::default();
        let user = Address::generate(&env);
        (env, user)
    }

    #[test]
    fn test_emit_event_success() {
        let (env, _) = setup();
        
        let result = emit_event(
            &env,
            EventType::BountyCreated,
            ContractType::Bounty,
            Symbol::new(&env, "test_data"),
        );
        
        assert!(result.is_ok());
        assert!(result.unwrap());
    }

    #[test]
    fn test_get_events_success() {
        let (env, _) = setup();
        
        emit_event(&env, EventType::GuildCreated, ContractType::Guild, Symbol::new(&env, "event1")).unwrap();
        emit_event(&env, EventType::BountyCreated, ContractType::Bounty, Symbol::new(&env, "event2")).unwrap();
        
        let events = get_events(&env, None, 0, 10);
        assert_eq!(events.len(), 2);
    }

    #[test]
    fn test_get_events_with_filter() {
        let (env, _) = setup();
        
        emit_event(&env, EventType::GuildCreated, ContractType::Guild, Symbol::new(&env, "guild")).unwrap();
        emit_event(&env, EventType::BountyCreated, ContractType::Bounty, Symbol::new(&env, "bounty")).unwrap();
        emit_event(&env, EventType::GuildMemberAdded, ContractType::Guild, Symbol::new(&env, "member")).unwrap();
        
        let filter = EventFilter {
            event_type: Some(EventType::GuildCreated),
            contract_source: None,
            from_timestamp: 0,
            to_timestamp: u64::MAX,
        };
        
        let events = get_events(&env, Some(filter), 0, 10);
        assert_eq!(events.len(), 1);
        assert_eq!(events.get(0).unwrap().event_type, EventType::GuildCreated);
    }

    #[test]
    fn test_subscribe_to_events_success() {
        let (env, user) = setup();
        
        let mut event_types = Vec::new(&env);
        event_types.push_back(EventType::BountyCreated);
        event_types.push_back(EventType::BountyFunded);
        
        let result = subscribe_to_events(&env, &user, event_types);
        assert!(result.is_ok());
    }

    #[test]
    fn test_get_event_by_id() {
        let (env, _) = setup();
        
        emit_event(&env, EventType::PaymentDistributed, ContractType::Payment, Symbol::new(&env, "payment")).unwrap();
        let event_id = get_event_count(&env);
        
        let event = get_event_by_id(&env, event_id).unwrap();
        assert_eq!(event.event_type, EventType::PaymentDistributed);
    }

    #[test]
    fn test_unsubscribe_from_events() {
        let (env, user) = setup();
        
        let mut event_types = Vec::new(&env);
        event_types.push_back(EventType::TreasuryDeposited);
        
        subscribe_to_events(&env, &user, event_types).unwrap();
        
        let result = unsubscribe_from_events(&env, &user);
        assert!(result.is_ok());
        
        let sub_result = get_subscription(&env, &user);
        assert!(matches!(sub_result, Err(IntegrationError::SubscriptionNotFound)));
    }

    #[test]
    fn test_event_id_uniqueness() {
        let (env, _) = setup();
        
        emit_event(&env, EventType::GuildCreated, ContractType::Guild, Symbol::new(&env, "e1")).unwrap();
        let id1 = get_event_count(&env);
        
        emit_event(&env, EventType::GuildCreated, ContractType::Guild, Symbol::new(&env, "e2")).unwrap();
        let id2 = get_event_count(&env);
        
        assert_ne!(id1, id2);
    }
}
