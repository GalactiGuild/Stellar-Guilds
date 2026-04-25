use soroban_sdk::{contractclient, Address, Env};

#[contractclient(name = "TokenSwapperClient")]
pub trait TokenSwapperTrait {
    fn get_quote(env: Env, from_asset: Address, to_asset: Address, amount: i128) -> i128;
    fn execute_swap(env: Env, from: Address, to: Address, amount: i128) -> i128;
}

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::{contract, contractimpl, testutils::Address as _};

    #[contract]
    pub struct MockSwapper;

    #[contractimpl]
    impl TokenSwapperTrait for MockSwapper {
        fn get_quote(_env: Env, _from_asset: Address, _to_asset: Address, amount: i128) -> i128 {
            amount // Hardcoded 1:1 ratio
        }

        fn execute_swap(_env: Env, _from: Address, _to: Address, amount: i128) -> i128 {
            amount // Hardcoded 1:1 ratio
        }
    }

    #[test]
    fn test_mock_swapper() {
        let env = Env::default();
        let swapper_id = env.register_contract(None, MockSwapper);
        let client = TokenSwapperClient::new(&env, &swapper_id);

        let from_asset = Address::generate(&env);
        let to_asset = Address::generate(&env);
        let amount = 1000;

        let quote = client.get_quote(&from_asset, &to_asset, &amount);
        assert_eq!(quote, amount);

        let swapped = client.execute_swap(&from_asset, &to_asset, &amount);
        assert_eq!(swapped, amount);
    }
}
