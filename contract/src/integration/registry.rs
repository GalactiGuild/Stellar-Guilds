/// Contract Registry Management.
///
/// Provides centralized registration and lookup of all platform contracts.
/// Only admin can register/update contracts.

use crate::integration::types::{
    ContractRegistryEntry, ContractType, ContractVersion, IntegrationError, IntegrationResult,
};
use soroban_sdk::{Address, Env, IntoVal, Map, Symbol, Vec};

/// Storage key for the contract registry.
pub const REGISTRY_KEY: &str = "contract_registry";

/// Storage key for the registry admin.
pub const REGISTRY_ADMIN_KEY: &str = "registry_admin";

/// Initialize the contract registry with an admin address.
pub fn initialize(env: &Env, admin: Address) {
    if env
        .storage()
        .instance()
        .has(&Symbol::new(env, REGISTRY_ADMIN_KEY))
    {
        panic!("Registry already initialized");
    }
    env.storage()
        .instance()
        .set(&Symbol::new(env, REGISTRY_ADMIN_KEY), &admin);
    
    let registry: Map<ContractType, ContractRegistryEntry> = Map::new(env);
    env.storage()
        .instance()
        .set(&Symbol::new(env, REGISTRY_KEY), &registry);
}

/// Verify the caller is the registry admin.
fn verify_admin(env: &Env, caller: &Address) -> IntegrationResult<()> {
    let admin: Address = env
        .storage()
        .instance()
        .get(&Symbol::new(env, REGISTRY_ADMIN_KEY))
        .ok_or(IntegrationError::RegistryCorrupted)?;
    
    if &admin != caller {
        return Err(IntegrationError::Unauthorized);
    }
    Ok(())
}

/// Register a new contract in the registry.
///
/// # Arguments
/// * `env` - The Soroban environment
/// * `caller` - Address making the request (must be admin)
/// * `contract_type` - Type of contract being registered
/// * `address` - Contract address
/// * `version` - Contract version number
///
/// # Returns
/// `true` if registration was successful
pub fn register_contract(
    env: &Env,
    caller: &Address,
    contract_type: ContractType,
    address: Address,
    version: u32,
) -> IntegrationResult<bool> {
    caller.require_auth();
    verify_admin(env, caller)?;
    
    // Validate address is not zero (check string representation)
    let addr_str = address.to_string();
    if addr_str.is_empty() {
        return Err(IntegrationError::InvalidAddress);
    }
    
    let mut registry: Map<ContractType, ContractRegistryEntry> = env
        .storage()
        .instance()
        .get(&Symbol::new(env, REGISTRY_KEY))
        .ok_or(IntegrationError::RegistryCorrupted)?;
    
    // Check for duplicate registration
    if registry.contains_key(contract_type.clone()) {
        let existing = registry.get(contract_type.clone()).unwrap();
        if existing.is_active {
            return Err(IntegrationError::DuplicateRegistration);
        }
    }
    
    let entry = ContractRegistryEntry {
        contract_type: contract_type.clone(),
        address: address.clone(),
        version,
        deployed_at: env.ledger().timestamp(),
        is_active: true,
    };
    
    registry.set(contract_type, entry);
    env.storage()
        .instance()
        .set(&Symbol::new(env, REGISTRY_KEY), &registry);
    
    Ok(true)
}

/// Get the address of a registered contract.
///
/// # Arguments
/// * `env` - The Soroban environment
/// * `contract_type` - Type of contract to lookup
///
/// # Returns
/// The contract address if found and active
pub fn get_contract_address(
    env: &Env,
    contract_type: ContractType,
) -> IntegrationResult<Address> {
    let registry: Map<ContractType, ContractRegistryEntry> = env
        .storage()
        .instance()
        .get(&Symbol::new(env, REGISTRY_KEY))
        .ok_or(IntegrationError::RegistryCorrupted)?;
    
    let entry = registry
        .get(contract_type)
        .ok_or(IntegrationError::ContractNotRegistered)?;
    
    if !entry.is_active {
        return Err(IntegrationError::ContractNotRegistered);
    }
    
    Ok(entry.address)
}

/// Update a contract's address and version.
///
/// # Arguments
/// * `env` - The Soroban environment
/// * `caller` - Address making the request (must be admin)
/// * `contract_type` - Type of contract to update
/// * `new_address` - New contract address
/// * `new_version` - New version number (must be higher)
///
/// # Returns
/// `true` if update was successful
pub fn update_contract(
    env: &Env,
    caller: &Address,
    contract_type: ContractType,
    new_address: Address,
    new_version: u32,
) -> IntegrationResult<bool> {
    caller.require_auth();
    verify_admin(env, caller)?;
    
    // Validate address is not zero (check string representation)
    let addr_str = new_address.to_string();
    if addr_str.is_empty() {
        return Err(IntegrationError::InvalidAddress);
    }
    
    let mut registry: Map<ContractType, ContractRegistryEntry> = env
        .storage()
        .instance()
        .get(&Symbol::new(env, REGISTRY_KEY))
        .ok_or(IntegrationError::RegistryCorrupted)?;
    
    let existing = registry
        .get(contract_type.clone())
        .ok_or(IntegrationError::ContractNotRegistered)?;
    
    // Version must increment
    if new_version <= existing.version {
        return Err(IntegrationError::VersionIncompatible);
    }
    
    let updated_entry = ContractRegistryEntry {
        contract_type: contract_type.clone(),
        address: new_address,
        version: new_version,
        deployed_at: env.ledger().timestamp(),
        is_active: true,
    };
    
    registry.set(contract_type, updated_entry);
    env.storage()
        .instance()
        .set(&Symbol::new(env, REGISTRY_KEY), &registry);
    
    Ok(true)
}

/// Get all registered contracts.
///
/// # Arguments
/// * `env` - The Soroban environment
///
/// # Returns
/// Vector of all active contract registry entries
pub fn get_all_contracts(env: &Env) -> Vec<ContractRegistryEntry> {
    let registry: Map<ContractType, ContractRegistryEntry> = env
        .storage()
        .instance()
        .get(&Symbol::new(env, REGISTRY_KEY))
        .unwrap_or_else(|| Map::new(env));
    
    let mut result = Vec::new(env);
    for entry in registry.values() {
        if entry.is_active {
            result.push_back(entry);
        }
    }
    result
}

/// Get contract version information.
///
/// # Arguments
/// * `env` - The Soroban environment
/// * `contract_type` - Type of contract
///
/// # Returns
/// Contract version information if registered
pub fn get_contract_version(
    env: &Env,
    contract_type: ContractType,
) -> IntegrationResult<ContractVersion> {
    let registry: Map<ContractType, ContractRegistryEntry> = env
        .storage()
        .instance()
        .get(&Symbol::new(env, REGISTRY_KEY))
        .ok_or(IntegrationError::RegistryCorrupted)?;
    
    let entry = registry
        .get(contract_type.clone())
        .ok_or(IntegrationError::ContractNotRegistered)?;
    
    if !entry.is_active {
        return Err(IntegrationError::ContractNotRegistered);
    }
    
    Ok(ContractVersion {
        contract_type,
        version: entry.version,
        address: entry.address,
        deployed_at: entry.deployed_at,
    })
}

/// Deactivate a contract in the registry.
///
/// # Arguments
/// * `env` - The Soroban environment
/// * `caller` - Address making the request (must be admin)
/// * `contract_type` - Type of contract to deactivate
///
/// # Returns
/// `true` if deactivation was successful
pub fn deactivate_contract(
    env: &Env,
    caller: &Address,
    contract_type: ContractType,
) -> IntegrationResult<bool> {
    caller.require_auth();
    verify_admin(env, caller)?;
    
    let mut registry: Map<ContractType, ContractRegistryEntry> = env
        .storage()
        .instance()
        .get(&Symbol::new(env, REGISTRY_KEY))
        .ok_or(IntegrationError::RegistryCorrupted)?;
    
    let mut entry = registry
        .get(contract_type.clone())
        .ok_or(IntegrationError::ContractNotRegistered)?;
    
    entry.is_active = false;
    registry.set(contract_type, entry);
    env.storage()
        .instance()
        .set(&Symbol::new(env, REGISTRY_KEY), &registry);
    
    Ok(true)
}

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::testutils::Address as _;

    fn setup() -> (Env, Address, Address) {
        let env = Env::default();
        let admin = Address::generate(&env);
        let user = Address::generate(&env);
        initialize(&env, admin.clone());
        (env, admin, user)
    }

    #[test]
    fn test_register_contract_success() {
        let (env, admin, _) = setup();
        let contract_addr = Address::generate(&env);
        
        let result = register_contract(
            &env,
            &admin,
            ContractType::Guild,
            contract_addr.clone(),
            1,
        );
        
        assert!(result.is_ok());
        assert!(result.unwrap());
    }

    #[test]
    fn test_get_contract_address_success() {
        let (env, admin, _) = setup();
        let contract_addr = Address::generate(&env);
        
        register_contract(&env, &admin, ContractType::Bounty, contract_addr.clone(), 1).unwrap();
        
        let result = get_contract_address(&env, ContractType::Bounty);
        assert!(result.is_ok());
        assert_eq!(result.unwrap(), contract_addr);
    }

    #[test]
    fn test_update_contract_success() {
        let (env, admin, _) = setup();
        let contract_addr1 = Address::generate(&env);
        let contract_addr2 = Address::generate(&env);
        
        register_contract(&env, &admin, ContractType::Payment, contract_addr1, 1).unwrap();
        
        let result = update_contract(&env, &admin, ContractType::Payment, contract_addr2, 2);
        assert!(result.is_ok());
        
        let version = get_contract_version(&env, ContractType::Payment).unwrap();
        assert_eq!(version.version, 2);
        assert_eq!(version.address, contract_addr2);
    }

    #[test]
    fn test_unauthorized_registration_fails() {
        let (env, _, user) = setup();
        let contract_addr = Address::generate(&env);
        
        let result = register_contract(
            &env,
            &user,
            ContractType::Guild,
            contract_addr,
            1,
        );
        
        assert!(matches!(result, Err(IntegrationError::Unauthorized)));
    }

    #[test]
    fn test_duplicate_registration_fails() {
        let (env, admin, _) = setup();
        let contract_addr = Address::generate(&env);
        
        register_contract(&env, &admin, ContractType::Treasury, contract_addr.clone(), 1).unwrap();
        
        let result = register_contract(
            &env,
            &admin,
            ContractType::Treasury,
            contract_addr,
            1,
        );
        
        assert!(matches!(result, Err(IntegrationError::DuplicateRegistration)));
    }

    #[test]
    fn test_get_unregistered_contract_fails() {
        let (env, _, _) = setup();
        
        let result = get_contract_address(&env, ContractType::Governance);
        assert!(matches!(result, Err(IntegrationError::ContractNotRegistered)));
    }

    #[test]
    fn test_version_must_increment() {
        let (env, admin, _) = setup();
        let contract_addr1 = Address::generate(&env);
        let contract_addr2 = Address::generate(&env);
        
        register_contract(&env, &admin, ContractType::Milestone, contract_addr1, 2).unwrap();
        
        let result = update_contract(&env, &admin, ContractType::Milestone, contract_addr2, 1);
        assert!(matches!(result, Err(IntegrationError::VersionIncompatible)));
    }

    #[test]
    fn test_get_all_contracts() {
        let (env, admin, _) = setup();
        let addr1 = Address::generate(&env);
        let addr2 = Address::generate(&env);
        
        register_contract(&env, &admin, ContractType::Guild, addr1, 1).unwrap();
        register_contract(&env, &admin, ContractType::Bounty, addr2, 1).unwrap();
        
        let contracts = get_all_contracts(&env);
        assert_eq!(contracts.len(), 2);
    }
}
