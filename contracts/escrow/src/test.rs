#![cfg(test)]

use super::*;
use soroban_sdk::testutils::Address as _;
use soroban_sdk::{Address, Env};

fn setup_escrow(env: &Env, token: &Address) -> (Address, Address, ContractClient<'static>) {
    env.mock_all_auths();
    let admin = Address::generate(env);
    let escrow_id = env.register(Contract, (admin.clone(), token.clone()));
    let client = ContractClient::new(env, &escrow_id);
    (admin, escrow_id, client)
}

fn setup_token(env: &Env) -> Address {
    let admin = Address::generate(env);
    env.register_stellar_asset_contract_v2(admin.clone())
        .address()
}

#[test]
fn test_unauthorized_lock_bid_without_auction() {
    let env = Env::default();
    env.mock_all_auths();

    let token = setup_token(&env);
    let (_admin, _escrow_id, escrow) = setup_escrow(&env, &token);

    let bidder = Address::generate(&env);

    let result = escrow.try_lock_bid(&1, &bidder, &1_000_000i128, &None, &0i128);
    assert_eq!(result, Err(Ok(EscrowError::AuctionNotConfigured)));
}

#[test]
fn test_set_auction_twice_fails() {
    let env = Env::default();
    env.mock_all_auths();

    let token = setup_token(&env);
    let (admin, _escrow_id, escrow) = setup_escrow(&env, &token);

    let auction = Address::generate(&env);
    escrow.set_auction_contract(&admin, &auction);

    let result = escrow.try_set_auction_contract(&admin, &Address::generate(&env));
    assert_eq!(result, Err(Ok(EscrowError::AuctionAlreadySet)));
}

#[test]
fn test_get_locked_balance_empty() {
    let env = Env::default();
    env.mock_all_auths();

    let token = setup_token(&env);
    let (_admin, _escrow_id, escrow) = setup_escrow(&env, &token);
    let bidder = Address::generate(&env);

    assert_eq!(escrow.get_locked_balance(&1, &bidder), 0);
}
