use crate::guild::storage::{GUILDS_KEY, GUILD_COUNTER_KEY, MEMBERS_KEY};
use crate::guild::types::{Guild, Member};
use soroban_sdk::{symbol_short, Address, Env, IntoVal, Map, Symbol, TryFromVal, Val};

const EXPORT_VERSION_KEY: Symbol = symbol_short!("mig_ver");
const EXPORT_VERSION: u32 = 1;

pub fn export_state(env: &Env, _admin: &Address) -> Map<Symbol, Val> {
    let mut state = Map::new(env);
    let guilds: Map<u64, Guild> = env
        .storage()
        .persistent()
        .get(&GUILDS_KEY)
        .unwrap_or_else(|| Map::new(env));
    let members: Map<u64, Map<Address, Member>> = env
        .storage()
        .persistent()
        .get(&MEMBERS_KEY)
        .unwrap_or_else(|| Map::new(env));
    let guild_counter: u64 = env
        .storage()
        .persistent()
        .get(&GUILD_COUNTER_KEY)
        .unwrap_or(0u64);

    state.set(EXPORT_VERSION_KEY, EXPORT_VERSION.into_val(env));
    state.set(GUILDS_KEY, guilds.into_val(env));
    state.set(MEMBERS_KEY, members.into_val(env));
    state.set(GUILD_COUNTER_KEY, guild_counter.into_val(env));
    state
}

pub fn import_state(env: &Env, _admin: &Address, state: Map<Symbol, Val>) -> bool {
    let version_val = state
        .get(EXPORT_VERSION_KEY)
        .unwrap_or_else(|| panic!("missing migration version"));
    let version = u32::try_from_val(env, &version_val).unwrap_or_else(|_| panic!("invalid migration version"));
    if version != EXPORT_VERSION {
        panic!("unsupported migration version");
    }

    let guilds_val = state
        .get(GUILDS_KEY)
        .unwrap_or_else(|| panic!("missing guild export"));
    let members_val = state
        .get(MEMBERS_KEY)
        .unwrap_or_else(|| panic!("missing member export"));
    let guild_counter_val = state
        .get(GUILD_COUNTER_KEY)
        .unwrap_or_else(|| panic!("missing guild counter export"));

    let guilds: Map<u64, Guild> = Map::try_from_val(env, &guilds_val)
        .unwrap_or_else(|_| panic!("invalid guild export"));
    let members: Map<u64, Map<Address, Member>> = Map::try_from_val(env, &members_val)
        .unwrap_or_else(|_| panic!("invalid member export"));
    let guild_counter = u64::try_from_val(env, &guild_counter_val)
        .unwrap_or_else(|_| panic!("invalid guild counter export"));

    env.storage().persistent().set(&GUILDS_KEY, &guilds);
    env.storage().persistent().set(&MEMBERS_KEY, &members);
    env.storage()
        .persistent()
        .set(&GUILD_COUNTER_KEY, &guild_counter);

    true
}
