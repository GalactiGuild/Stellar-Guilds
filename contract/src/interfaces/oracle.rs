use soroban_sdk::{contract, contractclient, contractimpl, BytesN, Env, Vec};

#[contractclient(name = "PriceOracleClient")]
pub trait PriceOracleTrait {
    fn get_latest_price(env: Env, asset_id: BytesN<32>) -> i128;
}

#[contract]
pub struct DummyPriceOracle;

#[contractimpl]
impl PriceOracleTrait for DummyPriceOracle {
    fn get_latest_price(env: Env, asset_id: BytesN<32>) -> i128 {
        dummy_price_sequence(&env, &asset_id)
            .last()
            .unwrap_or(0)
    }
}

pub fn dummy_price_sequence(env: &Env, asset_id: &BytesN<32>) -> Vec<i128> {
    let mut prices = Vec::new(env);
    let seed = asset_id.get(31).unwrap_or(0) as i128;

    prices.push_back(1_000_000 + seed);
    prices.push_back(1_010_000 + seed);
    prices.push_back(995_000 + seed);

    prices
}

#[cfg(test)]
mod tests {
    use super::*;

    fn asset_id(env: &Env, last_byte: u8) -> BytesN<32> {
        let mut bytes = [0_u8; 32];
        bytes[31] = last_byte;
        BytesN::from_array(env, &bytes)
    }

    #[test]
    fn dummy_sequence_is_deterministic_per_asset() {
        let env = Env::default();
        let asset = asset_id(&env, 7);
        let prices = dummy_price_sequence(&env, &asset);

        assert_eq!(prices.len(), 3);
        assert_eq!(prices.get(0).unwrap(), 1_000_007);
        assert_eq!(prices.get(1).unwrap(), 1_010_007);
        assert_eq!(prices.get(2).unwrap(), 995_007);
    }

    #[test]
    fn trait_client_executes_dummy_oracle_contract() {
        let env = Env::default();
        let contract_id = env.register_contract(None, DummyPriceOracle);
        let client = PriceOracleClient::new(&env, &contract_id);
        let asset = asset_id(&env, 42);

        let latest_price = client.get_latest_price(&asset);

        assert_eq!(latest_price, 995_042);
    }
}
