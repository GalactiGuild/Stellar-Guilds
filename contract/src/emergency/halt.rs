use crate::integration::auth::require_admin;
use soroban_sdk::{contracttype, Env};

#[contracttype]
pub enum HaltKey {
    IsHalted,
}

/// Halt the contract. Only callable by the contract admin.
pub fn halt_contract(env: &Env, caller: &soroban_sdk::Address) {
    require_admin(env, caller);
    env.storage().instance().set(&HaltKey::IsHalted, &true);
}

/// Resume the contract. Only callable by the contract admin.
pub fn resume_contract(env: &Env, caller: &soroban_sdk::Address) {
    require_admin(env, caller);
    env.storage().instance().set(&HaltKey::IsHalted, &false);
}

/// Panics if the contract is currently halted.
/// Call this at the top of any function that should be blocked during a halt.
pub fn ensure_not_halted(env: &Env) {
    let halted: bool = env
        .storage()
        .instance()
        .get(&HaltKey::IsHalted)
        .unwrap_or(false);
    if halted {
        panic!("contract is halted");
    }
}

#[cfg(test)]
mod halt_tests {
    use super::*;
    use crate::DataKey;
    use crate::StellarGuildsContract;
    use soroban_sdk::testutils::Address as _;
    use soroban_sdk::{Address, Env};

    fn setup() -> (Env, Address, Address) {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register_contract(None, StellarGuildsContract);
        let admin = Address::generate(&env);
        // Store admin in instance storage so require_admin can find it
        env.as_contract(&contract_id, || {
            env.storage().instance().set(&DataKey::Admin, &admin);
        });
        (env, contract_id, admin)
    }

    #[test]
    fn test_halt_and_resume() {
        let (env, contract_id, admin) = setup();
        env.as_contract(&contract_id, || {
            // Initially not halted
            ensure_not_halted(&env); // should not panic

            halt_contract(&env, &admin);

            let halted: bool = env
                .storage()
                .instance()
                .get(&HaltKey::IsHalted)
                .unwrap_or(false);
            assert!(halted);

            resume_contract(&env, &admin);

            let halted_after: bool = env
                .storage()
                .instance()
                .get(&HaltKey::IsHalted)
                .unwrap_or(false);
            assert!(!halted_after);

            ensure_not_halted(&env); // should not panic after resume
        });
    }

    #[test]
    #[should_panic(expected = "contract is halted")]
    fn test_ensure_not_halted_panics_when_halted() {
        let (env, contract_id, admin) = setup();
        env.as_contract(&contract_id, || {
            halt_contract(&env, &admin);
            ensure_not_halted(&env);
        });
    }
}
