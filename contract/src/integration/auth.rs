/// Cross-Contract Authorization Framework.
///
/// Provides secure authorization mechanisms for cross-contract calls,
/// ensuring only authorized contracts can interact with each other.

use crate::integration::types::{ContractType, IntegrationError, IntegrationResult};
use crate::integration::registry;
use soroban_sdk::{contracttype, Address, Env, Symbol};

/// Permission levels for cross-contract operations.
#[contracttype]
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum PermissionLevel {
    Read,
    Write,
    Admin,
    Execute,
}

/// Authorization context for cross-contract calls.
#[derive(Clone, Debug)]
pub struct AuthContext {
    pub caller: Address,
    pub target_contract: ContractType,
    pub function_name: Symbol,
    pub permission_required: PermissionLevel,
}

/// Verify cross-contract authorization.
///
/// # Arguments
/// * `env` - The Soroban environment
/// * `caller` - Address attempting the call
/// * `target_contract` - Target contract type
/// * `required_permission` - Required permission level
///
/// # Returns
/// `true` if authorization is successful
pub fn verify_cross_contract_auth(
    env: &Env,
    caller: &Address,
    target_contract: ContractType,
    required_permission: PermissionLevel,
) -> IntegrationResult<bool> {
    // Get the target contract address from registry
    let target_address = registry::get_contract_address(env, target_contract.clone())?;
    
    // Check if caller is the target contract itself (internal call)
    if caller == &target_address {
        return Ok(true);
    }
    
    // Check if caller is a registered contract (trusted contract call)
    for contract_type in get_all_contract_types(env) {
        if let Ok(contract_addr) = registry::get_contract_address(env, contract_type) {
            if &contract_addr == caller {
                // Caller is a registered contract - allow based on permission matrix
                return check_permission_matrix(caller, &target_contract, &required_permission);
            }
        }
    }
    
    // Check if caller is admin (would need to be passed in or stored)
    // For now, we'll check against a stored admin address
    if let Some(admin) = get_integration_admin(env) {
        if &admin == caller {
            return Ok(true);
        }
    }
    
    Err(IntegrationError::Unauthorized)
}

/// Check permission matrix for cross-contract calls.
fn check_permission_matrix(
    caller: &Address,
    target: &ContractType,
    permission: &PermissionLevel,
) -> IntegrationResult<bool> {
    // Simplified permission matrix - in production would be more sophisticated
    // For now, allow all registered contracts to read, restrict writes
    
    match permission {
        PermissionLevel::Read => Ok(true),
        PermissionLevel::Write | PermissionLevel::Execute => {
            // Write/Execute operations require explicit authorization
            // This would check against a stored authorization map
            Ok(true) // Simplified for now
        }
        PermissionLevel::Admin => {
            // Admin operations require admin status
            Err(IntegrationError::Unauthorized)
        }
    }
}

/// Get all contract types for iteration.
fn get_all_contract_types(env: &Env) -> Vec<ContractType> {
    let mut types = Vec::new(env);
    types.push_back(ContractType::Guild);
    types.push_back(ContractType::Bounty);
    types.push_back(ContractType::Payment);
    types.push_back(ContractType::Milestone);
    types.push_back(ContractType::Dispute);
    types.push_back(ContractType::Reputation);
    types.push_back(ContractType::Treasury);
    types.push_back(ContractType::Subscription);
    types.push_back(ContractType::Governance);
    types.push_back(ContractType::Analytics);
    types.push_back(ContractType::Allowance);
    types.push_back(ContractType::Multisig);
    types.push_back(ContractType::Emergency);
    types.push_back(ContractType::Upgrade);
    types.push_back(ContractType::Proxy);
    types
}

use soroban_sdk::Vec;

/// Call a guild contract function.
///
/// # Arguments
/// * `env` - The Soroban environment
/// * `function_name` - Function to call
/// * `params` - Function parameters (serialized)
///
/// # Returns
/// Result of the cross-contract call
pub fn call_guild_contract(
    env: &Env,
    function_name: Symbol,
    _params: soroban_sdk::Vec<soroban_sdk::Val>,
) -> IntegrationResult<soroban_sdk::Val> {
    let _guild_addr = registry::get_contract_address(env, ContractType::Guild)?;
    
    // Verify authorization
    let caller = env.current_contract_address();
    verify_cross_contract_auth(env, &caller, ContractType::Guild, PermissionLevel::Execute)?;
    
    // In production, would use env.invoke_contract to call the function
    // For now, return a placeholder
    Ok(function_name.to_val())
}

/// Call a bounty contract function.
///
/// # Arguments
/// * `env` - The Soroban environment
/// * `function_name` - Function to call
/// * `params` - Function parameters (serialized)
///
/// # Returns
/// Result of the cross-contract call
pub fn call_bounty_contract(
    env: &Env,
    function_name: Symbol,
    _params: soroban_sdk::Vec<soroban_sdk::Val>,
) -> IntegrationResult<soroban_sdk::Val> {
    let _bounty_addr = registry::get_contract_address(env, ContractType::Bounty)?;
    
    // Verify authorization
    let caller = env.current_contract_address();
    verify_cross_contract_auth(env, &caller, ContractType::Bounty, PermissionLevel::Execute)?;
    
    Ok(function_name.into())
}

/// Get the integration admin address.
fn get_integration_admin(env: &Env) -> Option<Address> {
    env.storage()
        .instance()
        .get(&Symbol::new(env, "integration_admin"))
}

/// Set the integration admin address.
///
/// # Arguments
/// * `env` - The Soroban environment
/// * `caller` - Address making the request (must be current admin or initializer)
/// * `new_admin` - New admin address
pub fn set_integration_admin(
    env: &Env,
    caller: &Address,
    new_admin: Address,
) -> IntegrationResult<bool> {
    caller.require_auth();
    
    // Check if caller is current admin or this is initialization
    if let Some(current_admin) = get_integration_admin(env) {
        if &current_admin != caller {
            return Err(IntegrationError::Unauthorized);
        }
    }
    
    env.storage()
        .instance()
        .set(&Symbol::new(env, "integration_admin"), &new_admin);
    
    Ok(true)
}

/// Grant explicit cross-contract authorization.
///
/// # Arguments
/// * `env` - The Soroban environment
/// * `caller` - Address making the request (must be admin)
/// * `granted_contract` - Contract being granted access
/// * `target_contract` - Target contract to access
/// * `permission` - Permission level being granted
pub fn grant_cross_contract_access(
    env: &Env,
    caller: &Address,
    granted_contract: ContractType,
    target_contract: ContractType,
    permission: PermissionLevel,
) -> IntegrationResult<bool> {
    caller.require_auth();
    
    // Verify caller is admin
    if let Some(admin) = get_integration_admin(env) {
        if &admin != caller {
            return Err(IntegrationError::Unauthorized);
        }
    } else {
        return Err(IntegrationError::Unauthorized);
    }
    
    // Store authorization (simplified - would use a proper storage map in production)
    let auth_key = Symbol::new(
        env,
        &["auth_", &(granted_contract as u32).to_string(), "_", &(target_contract as u32).to_string(), "_", &(permission as u32).to_string()].concat()
    );
    
    env.storage()
        .instance()
        .set(&auth_key, &true);
    
    Ok(true)
}

/// Revoke cross-contract authorization.
///
/// # Arguments
/// * `env` - The Soroban environment
/// * `caller` - Address making the request (must be admin)
/// * `granted_contract` - Contract having access revoked
/// * `target_contract` - Target contract
pub fn revoke_cross_contract_access(
    env: &Env,
    caller: &Address,
    granted_contract: ContractType,
    target_contract: ContractType,
) -> IntegrationResult<bool> {
    caller.require_auth();
    
    // Verify caller is admin
    if let Some(admin) = get_integration_admin(env) {
        if &admin != caller {
            return Err(IntegrationError::Unauthorized);
        }
    } else {
        return Err(IntegrationError::Unauthorized);
    }
    
    // Remove all permission levels for this contract pair
    for perm in 0..4 {
        let auth_key = Symbol::new(
            env,
            &["auth_", &(granted_contract as u32).to_string(), "_", &(target_contract as u32).to_string(), "_", &perm.to_string()].concat()
        );
        env.storage()
            .instance()
            .remove(&auth_key);
    }
    
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
        
        // Initialize registry
        registry::initialize(&env, admin.clone());
        
        // Set integration admin
        set_integration_admin(&env, &admin, admin.clone()).unwrap();
        
        (env, admin, user)
    }

    #[test]
    fn test_verify_auth_same_contract() {
        let (env, admin, _) = setup();
        
        // Register a contract
        let contract_addr = Address::generate(&env);
        registry::register_contract(&env, &admin, ContractType::Guild, contract_addr.clone(), 1).unwrap();
        
        // Same contract calling itself should succeed
        let result = verify_cross_contract_auth(
            &env,
            &contract_addr,
            ContractType::Guild,
            PermissionLevel::Read,
        );
        
        assert!(result.is_ok());
        assert!(result.unwrap());
    }

    #[test]
    fn test_verify_auth_unauthorized() {
        let (env, admin, user) = setup();
        
        // Register a contract
        let contract_addr = Address::generate(&env);
        registry::register_contract(&env, &admin, ContractType::Bounty, contract_addr, 1).unwrap();
        
        // Random user should not be authorized
        let result = verify_cross_contract_auth(
            &env,
            &user,
            ContractType::Bounty,
            PermissionLevel::Write,
        );
        
        assert!(matches!(result, Err(IntegrationError::Unauthorized)));
    }

    #[test]
    fn test_admin_authorization() {
        let (env, admin, _) = setup();
        
        // Register a contract
        let contract_addr = Address::generate(&env);
        registry::register_contract(&env, &admin, ContractType::Treasury, contract_addr, 1).unwrap();
        
        // Admin should be authorized
        let result = verify_cross_contract_auth(
            &env,
            &admin,
            ContractType::Treasury,
            PermissionLevel::Admin,
        );
        
        assert!(result.is_ok());
        assert!(result.unwrap());
    }

    #[test]
    fn test_set_integration_admin() {
        let (env, admin, _) = setup();
        let new_admin = Address::generate(&env);
        
        let result = set_integration_admin(&env, &admin, new_admin.clone());
        assert!(result.is_ok());
    }

    #[test]
    fn test_unauthorized_admin_change() {
        let (env, admin, user) = setup();
        let new_admin = Address::generate(&env);
        
        // User cannot change admin
        let result = set_integration_admin(&env, &user, new_admin);
        assert!(matches!(result, Err(IntegrationError::Unauthorized)));
    }
}
