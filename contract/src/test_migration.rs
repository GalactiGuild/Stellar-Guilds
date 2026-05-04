#![cfg(test)]

use crate::{guild::types::Role, StellarGuildsContract, StellarGuildsContractClient};
use soroban_sdk::{testutils::Address as _, Address, Env, String};

#[test]
fn export_import_state_preserves_guilds_and_members() {
    let env = Env::default();
    env.mock_all_auths();

    let source_id = env.register_contract(None, StellarGuildsContract);
    let target_id = env.register_contract(None, StellarGuildsContract);
    let source = StellarGuildsContractClient::new(&env, &source_id);
    let target = StellarGuildsContractClient::new(&env, &target_id);

    let admin = Address::generate(&env);
    let member = Address::generate(&env);

    source.initialize(&admin);
    target.initialize(&admin);

    let guild_id = source.create_guild(
        &String::from_str(&env, "Migration Guild"),
        &String::from_str(&env, "Legacy state export test"),
        &admin,
        &None,
    );
    source.add_member(&guild_id, &member, &Role::Member, &admin);

    let state = source.export_state(&admin);
    assert!(target.import_state(&admin, &state));

    let migrated_members = target.get_all_members(&guild_id);
    assert_eq!(migrated_members.len(), 2);

    let migrated_member = target.get_member(&guild_id, &member);
    assert_eq!(migrated_member.role, Role::Member);

    let next_guild_id = target.create_guild(
        &String::from_str(&env, "Next Guild"),
        &String::from_str(&env, "Counter continuity test"),
        &admin,
        &None,
    );
    assert_eq!(next_guild_id, guild_id + 1);
}

#[test]
#[should_panic]
fn export_state_rejects_non_admin_callers() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, StellarGuildsContract);
    let client = StellarGuildsContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let stranger = Address::generate(&env);

    client.initialize(&admin);
    client.export_state(&stranger);
}
