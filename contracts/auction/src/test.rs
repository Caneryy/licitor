#![cfg(test)]

use super::*;
use escrow::{Contract as EscrowContract, ContractClient as EscrowContractClient};
use soroban_sdk::testutils::{Address as _, Events, Ledger, LedgerInfo};
use soroban_sdk::token::{Client as TokenClient, StellarAssetClient};
use soroban_sdk::{Address, Env, String};

struct TestContext<'a> {
    env: Env,
    seller: Address,
    auction: ContractClient<'a>,
    escrow: EscrowContractClient<'a>,
    token: Address,
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

fn setup() -> TestContext<'static> {
    let env = Env::default();
    env.mock_all_auths();
    set_ledger(&env, 1_000);

    let token_admin = Address::generate(&env);
    let token = env
        .register_stellar_asset_contract_v2(token_admin.clone())
        .address();

    let escrow_admin = Address::generate(&env);
    let escrow_id = env.register(EscrowContract, (escrow_admin.clone(), token.clone()));
    let escrow = EscrowContractClient::new(&env, &escrow_id);

    let auction_id = env.register(Contract, (escrow_id.clone(),));
    let auction = ContractClient::new(&env, &auction_id);
    escrow.set_auction_contract(&escrow_admin, &auction_id);

    let seller = Address::generate(&env);

    TestContext {
        env,
        seller,
        auction,
        escrow,
        token,
    }
}

fn mint(ctx: &TestContext, to: &Address, amount: i128) {
    let stellar = StellarAssetClient::new(&ctx.env, &ctx.token);
    stellar.mint(to, &amount);
}

#[test]
fn test_create_auction() {
    let ctx = setup();

    let id = ctx.auction.create_auction(
        &ctx.seller,
        &String::from_str(&ctx.env, "Vintage Lamp"),
        &1_000_000i128,
        &3600u64,
    );

    assert_eq!(id, 1);
    assert_eq!(ctx.auction.get_auction_count(), 1);

    let auction = ctx.auction.get_auction(&1);
    assert_eq!(auction.seller, ctx.seller);
    assert_eq!(auction.starting_bid, 1_000_000);
    assert_eq!(auction.highest_bid, 1_000_000);
    assert_eq!(auction.status, AuctionStatus::Active);

    let history = ctx.auction.get_recent_bids(&1);
    assert_eq!(history.len(), 0);
}

#[test]
fn test_place_bid_updates_highest_and_history() {
    let ctx = setup();

    ctx.auction.create_auction(
        &ctx.seller,
        &String::from_str(&ctx.env, "Desk"),
        &1_000_000i128,
        &3600u64,
    );

    let bidder = Address::generate(&ctx.env);
    mint(&ctx, &bidder, 5_000_000);
    ctx.auction.place_bid(&bidder, &1, &2_000_000i128);

    let auction = ctx.auction.get_auction(&1);
    assert_eq!(auction.highest_bid, 2_000_000);
    assert_eq!(auction.highest_bidder, Some(bidder.clone()));

    let history = ctx.auction.get_recent_bids(&1);
    assert_eq!(history.len(), 1);
    assert_eq!(history.get(0).unwrap().bidder, bidder);

    let token = TokenClient::new(&ctx.env, &ctx.token);
    assert_eq!(token.balance(&bidder), 3_000_000);
}

#[test]
fn test_history_caps_at_ten() {
    let ctx = setup();

    ctx.auction.create_auction(
        &ctx.seller,
        &String::from_str(&ctx.env, "Chair"),
        &1_000_000i128,
        &3600u64,
    );

    for i in 0..11 {
        let bidder = Address::generate(&ctx.env);
        mint(&ctx, &bidder, 20_000_000);
        let amount = 2_000_000i128 + i as i128 * 1_000_000;
        ctx.auction.place_bid(&bidder, &1, &amount);
    }

    let history = ctx.auction.get_recent_bids(&1);
    assert_eq!(history.len(), 10);
    assert_eq!(history.get(0).unwrap().amount, 12_000_000);
}

#[test]
fn test_bid_too_low() {
    let ctx = setup();

    ctx.auction.create_auction(
        &ctx.seller,
        &String::from_str(&ctx.env, "Clock"),
        &5_000_000i128,
        &3600u64,
    );

    let bidder = Address::generate(&ctx.env);
    mint(&ctx, &bidder, 10_000_000);
    let result = ctx.auction.try_place_bid(&bidder, &1, &4_000_000i128);
    assert_eq!(result, Err(Ok(ContractError::BidTooLow)));
}

#[test]
fn test_finalize_after_end() {
    let ctx = setup();

    ctx.auction.create_auction(
        &ctx.seller,
        &String::from_str(&ctx.env, "Vase"),
        &1_000_000i128,
        &100u64,
    );

    let bidder = Address::generate(&ctx.env);
    mint(&ctx, &bidder, 5_000_000);
    ctx.auction.place_bid(&bidder, &1, &2_000_000i128);

    set_ledger(&ctx.env, 1_200);
    ctx.auction.finalize_auction(&ctx.seller, &1);

    let auction = ctx.auction.get_auction(&1);
    assert_eq!(auction.status, AuctionStatus::Ended);

    let token = TokenClient::new(&ctx.env, &ctx.token);
    assert_eq!(token.balance(&ctx.seller), 2_000_000);
}

#[test]
fn test_finalize_still_active() {
    let ctx = setup();

    ctx.auction.create_auction(
        &ctx.seller,
        &String::from_str(&ctx.env, "Rug"),
        &1_000_000i128,
        &3600u64,
    );

    let result = ctx.auction.try_finalize_auction(&ctx.seller, &1);
    assert_eq!(result, Err(Ok(ContractError::AuctionStillActive)));
}

#[test]
fn test_auction_not_found() {
    let ctx = setup();
    let result = ctx.auction.try_get_auction(&99);
    assert_eq!(result, Err(Ok(ContractError::AuctionNotFound)));
}

#[test]
fn test_auction_ended_blocks_bid() {
    let ctx = setup();

    ctx.auction.create_auction(
        &ctx.seller,
        &String::from_str(&ctx.env, "Ended Item"),
        &1_000_000i128,
        &100u64,
    );

    let bidder = Address::generate(&ctx.env);
    mint(&ctx, &bidder, 5_000_000);
    ctx.auction.place_bid(&bidder, &1, &2_000_000i128);

    set_ledger(&ctx.env, 1_200);
    ctx.auction.finalize_auction(&ctx.seller, &1);

    let bidder2 = Address::generate(&ctx.env);
    mint(&ctx, &bidder2, 5_000_000);
    let result = ctx.auction.try_place_bid(&bidder2, &1, &3_000_000i128);
    assert_eq!(result, Err(Ok(ContractError::AuctionEnded)));
}

#[test]
fn test_auction_expired_blocks_bid() {
    let ctx = setup();

    ctx.auction.create_auction(
        &ctx.seller,
        &String::from_str(&ctx.env, "Expired"),
        &1_000_000i128,
        &50u64,
    );

    set_ledger(&ctx.env, 1_100);

    let bidder = Address::generate(&ctx.env);
    mint(&ctx, &bidder, 5_000_000);
    let result = ctx.auction.try_place_bid(&bidder, &1, &2_000_000i128);
    assert_eq!(result, Err(Ok(ContractError::AuctionExpired)));
}

#[test]
fn test_invalid_starting_bid() {
    let ctx = setup();
    let result = ctx.auction.try_create_auction(
        &ctx.seller,
        &String::from_str(&ctx.env, "Bad"),
        &0i128,
        &3600u64,
    );
    assert_eq!(result, Err(Ok(ContractError::InvalidStartingBid)));
}

#[test]
fn test_invalid_duration() {
    let ctx = setup();
    let result = ctx.auction.try_create_auction(
        &ctx.seller,
        &String::from_str(&ctx.env, "Bad"),
        &1_000_000i128,
        &0u64,
    );
    assert_eq!(result, Err(Ok(ContractError::InvalidDuration)));
}

#[test]
fn test_unauthorized_finalizer() {
    let ctx = setup();

    ctx.auction.create_auction(
        &ctx.seller,
        &String::from_str(&ctx.env, "Auth"),
        &1_000_000i128,
        &100u64,
    );

    set_ledger(&ctx.env, 1_200);
    let stranger = Address::generate(&ctx.env);
    let result = ctx.auction.try_finalize_auction(&stranger, &1);
    assert_eq!(result, Err(Ok(ContractError::UnauthorizedFinalizer)));
}

#[test]
fn test_double_finalize() {
    let ctx = setup();

    ctx.auction.create_auction(
        &ctx.seller,
        &String::from_str(&ctx.env, "Twice"),
        &1_000_000i128,
        &100u64,
    );

    set_ledger(&ctx.env, 1_200);
    ctx.auction.finalize_auction(&ctx.seller, &1);

    let result = ctx.auction.try_finalize_auction(&ctx.seller, &1);
    assert_eq!(result, Err(Ok(ContractError::AuctionEnded)));
}

#[test]
fn test_finalize_without_bids() {
    let ctx = setup();

    ctx.auction.create_auction(
        &ctx.seller,
        &String::from_str(&ctx.env, "No Bids"),
        &1_000_000i128,
        &100u64,
    );

    set_ledger(&ctx.env, 1_200);
    ctx.auction.finalize_auction(&ctx.seller, &1);

    let auction = ctx.auction.get_auction(&1);
    assert_eq!(auction.status, AuctionStatus::Ended);
    assert_eq!(auction.highest_bidder, None);
}

#[test]
fn test_bid_refunds_previous_bidder() {
    let ctx = setup();

    ctx.auction.create_auction(
        &ctx.seller,
        &String::from_str(&ctx.env, "Refund"),
        &1_000_000i128,
        &3600u64,
    );

    let bidder_a = Address::generate(&ctx.env);
    let bidder_b = Address::generate(&ctx.env);
    mint(&ctx, &bidder_a, 5_000_000);
    mint(&ctx, &bidder_b, 5_000_000);

    ctx.auction.place_bid(&bidder_a, &1, &2_000_000i128);
    ctx.auction.place_bid(&bidder_b, &1, &3_000_000i128);

    let token = TokenClient::new(&ctx.env, &ctx.token);
    assert_eq!(token.balance(&bidder_a), 5_000_000);
    assert_eq!(token.balance(&bidder_b), 2_000_000);
}

#[test]
fn test_bid_placed_event_emitted() {
    let ctx = setup();

    ctx.auction.create_auction(
        &ctx.seller,
        &String::from_str(&ctx.env, "Events"),
        &1_000_000i128,
        &3600u64,
    );

    let bidder = Address::generate(&ctx.env);
    mint(&ctx, &bidder, 5_000_000);
    ctx.auction.place_bid(&bidder, &1, &2_000_000i128);

    let events = ctx.env.events().all();
    assert!(!events.events().is_empty());
}

#[test]
fn test_multiple_auctions() {
    let ctx = setup();

    let id1 = ctx.auction.create_auction(
        &ctx.seller,
        &String::from_str(&ctx.env, "First"),
        &1_000_000i128,
        &3600u64,
    );
    let id2 = ctx.auction.create_auction(
        &ctx.seller,
        &String::from_str(&ctx.env, "Second"),
        &2_000_000i128,
        &3600u64,
    );

    assert_eq!(id1, 1);
    assert_eq!(id2, 2);
    assert_eq!(ctx.auction.get_auction_count(), 2);
}
