#![cfg(test)]

use super::*;
use soroban_sdk::testutils::{Address as _, Ledger, LedgerInfo};
use soroban_sdk::{Address, Env, String};

fn setup() -> (Env, Address, ContractClient<'static>) {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);
    let seller = Address::generate(&env);
    (env, seller, client)
}

fn set_ledger(env: &Env, timestamp: u64) {
    env.ledger().set(LedgerInfo {
        timestamp,
        protocol_version: 25,
        sequence_number: 100,
        network_id: Default::default(),
        base_reserve: 10,
        min_temp_entry_ttl: 16,
        min_persistent_entry_ttl: 16,
        max_entry_ttl: 631_200,
    });
}

#[test]
fn test_create_auction() {
    let (env, seller, client) = setup();
    set_ledger(&env, 1_000);

    let id = client.create_auction(
        &seller,
        &String::from_str(&env, "Vintage Lamp"),
        &1_000_000i128,
        &3600u64,
    );

    assert_eq!(id, 1);
    assert_eq!(client.get_auction_count(), 1);

    let auction = client.get_auction(&1);
    assert_eq!(auction.seller, seller);
    assert_eq!(auction.starting_bid, 1_000_000);
    assert_eq!(auction.highest_bid, 1_000_000);
    assert_eq!(auction.status, AuctionStatus::Active);

    let history = client.get_recent_bids(&1);
    assert_eq!(history.len(), 0);
}

#[test]
fn test_place_bid_updates_highest_and_history() {
    let (env, seller, client) = setup();
    set_ledger(&env, 1_000);

    client.create_auction(
        &seller,
        &String::from_str(&env, "Desk"),
        &1_000_000i128,
        &3600u64,
    );

    let bidder = Address::generate(&env);
    client.place_bid(&bidder, &1, &2_000_000i128);

    let auction = client.get_auction(&1);
    assert_eq!(auction.highest_bid, 2_000_000);
    assert_eq!(auction.highest_bidder, Some(bidder.clone()));

    let history = client.get_recent_bids(&1);
    assert_eq!(history.len(), 1);
    assert_eq!(history.get(0).unwrap().bidder, bidder);
}

#[test]
fn test_history_caps_at_ten() {
    let (env, seller, client) = setup();
    set_ledger(&env, 1_000);

    client.create_auction(
        &seller,
        &String::from_str(&env, "Chair"),
        &1_000_000i128,
        &3600u64,
    );

    for i in 0..11 {
        let bidder = Address::generate(&env);
        let amount = 2_000_000i128 + i as i128 * 1_000_000;
        client.place_bid(&bidder, &1, &amount);
    }

    let history = client.get_recent_bids(&1);
    assert_eq!(history.len(), 10);
    assert_eq!(history.get(0).unwrap().amount, 12_000_000);
}

#[test]
fn test_bid_too_low() {
    let (env, seller, client) = setup();
    set_ledger(&env, 1_000);

    client.create_auction(
        &seller,
        &String::from_str(&env, "Clock"),
        &5_000_000i128,
        &3600u64,
    );

    let bidder = Address::generate(&env);
    let result = client.try_place_bid(&bidder, &1, &4_000_000i128);
    assert_eq!(result, Err(Ok(ContractError::BidTooLow)));
}

#[test]
fn test_finalize_after_end() {
    let (env, seller, client) = setup();
    set_ledger(&env, 1_000);

    client.create_auction(
        &seller,
        &String::from_str(&env, "Vase"),
        &1_000_000i128,
        &100u64,
    );

    let bidder = Address::generate(&env);
    client.place_bid(&bidder, &1, &2_000_000i128);

    set_ledger(&env, 1_200);
    client.finalize_auction(&seller, &1);

    let auction = client.get_auction(&1);
    assert_eq!(auction.status, AuctionStatus::Ended);
}

#[test]
fn test_finalize_still_active() {
    let (env, seller, client) = setup();
    set_ledger(&env, 1_000);

    client.create_auction(
        &seller,
        &String::from_str(&env, "Rug"),
        &1_000_000i128,
        &3600u64,
    );

    let result = client.try_finalize_auction(&seller, &1);
    assert_eq!(result, Err(Ok(ContractError::AuctionStillActive)));
}
