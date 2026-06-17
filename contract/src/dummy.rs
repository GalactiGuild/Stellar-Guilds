use soroban_sdk::{panic_with_error, Env};
use crate::errors::ErrorCode;

pub fn restricted_function(env: &Env) {
    // This was previously: panic!("Unauthorized")
    panic_with_error!(env, ErrorCode::Unauthorized);
}

pub fn admin_only_action(env: &Env) {
    // This was previously: panic!("Access denied")
    panic_with_error!(env, ErrorCode::Unauthorized);
}
