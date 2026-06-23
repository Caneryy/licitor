#![no_std]
use soroban_sdk::{
    contract, contracterror, contractevent, contractimpl, contracttype, Address, Env, String, Vec,
};

const MIN_TTL: u32 = 17_280;
const EXTEND_TO: u32 = 518_400;
const MAX_BID_HISTORY: u32 = 10;

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DataKey {
    AuctionCount,
    Auction(u32),
    BidHistory(u32),
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum AuctionStatus {
    Active,
    Ended,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Auction {
    pub seller: Address,
    pub title: String,
    pub starting_bid: i128,
    pub highest_bid: i128,
    pub highest_bidder: Option<Address>,
    pub end_time: u64,
    pub status: AuctionStatus,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct BidEntry {
    pub bidder: Address,
    pub amount: i128,
    pub timestamp: u64,
    pub ledger: u32,
}

#[contractevent(topics = ["bid_placed"])]
pub struct BidPlacedEvent {
    pub auction_id: u32,
    pub bidder: Address,
    pub amount: i128,
    pub ledger: u32,
}

#[contractevent(topics = ["auction_created"])]
pub struct AuctionCreatedEvent {
    pub auction_id: u32,
    pub seller: Address,
}

#[contractevent(topics = ["auction_finalized"])]
pub struct AuctionFinalizedEvent {
    pub auction_id: u32,
    pub winner: Option<Address>,
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum ContractError {
    AuctionNotFound = 1,
    AuctionEnded = 2,
    BidTooLow = 3,
    AuctionStillActive = 4,
    AuctionExpired = 5,
    InvalidStartingBid = 6,
    InvalidDuration = 7,
}

#[contract]
pub struct Contract;

#[contractimpl]
impl Contract {
    pub fn __constructor(env: Env) {
        env.storage().instance().set(&DataKey::AuctionCount, &0u32);
        env.storage()
            .instance()
            .extend_ttl(MIN_TTL, EXTEND_TO);
    }

    pub fn create_auction(
        env: Env,
        seller: Address,
        title: String,
        starting_bid: i128,
        duration_secs: u64,
    ) -> Result<u32, ContractError> {
        seller.require_auth();

        if starting_bid <= 0 {
            return Err(ContractError::InvalidStartingBid);
        }
        if duration_secs == 0 {
            return Err(ContractError::InvalidDuration);
        }

        let count: u32 = env
            .storage()
            .instance()
            .get(&DataKey::AuctionCount)
            .unwrap_or(0);
        let auction_id = count + 1;

        let now = env.ledger().timestamp();
        let auction = Auction {
            seller: seller.clone(),
            title,
            starting_bid,
            highest_bid: starting_bid,
            highest_bidder: None,
            end_time: now + duration_secs,
            status: AuctionStatus::Active,
        };

        let auction_key = DataKey::Auction(auction_id);
        let history_key = DataKey::BidHistory(auction_id);

        env.storage().persistent().set(&auction_key, &auction);
        env.storage()
            .persistent()
            .set(&history_key, &Vec::<BidEntry>::new(&env));
        env.storage()
            .persistent()
            .extend_ttl(&auction_key, MIN_TTL, EXTEND_TO);
        env.storage()
            .persistent()
            .extend_ttl(&history_key, MIN_TTL, EXTEND_TO);

        env.storage()
            .instance()
            .set(&DataKey::AuctionCount, &auction_id);
        env.storage()
            .instance()
            .extend_ttl(MIN_TTL, EXTEND_TO);

        AuctionCreatedEvent {
            auction_id,
            seller,
        }
        .publish(&env);

        Ok(auction_id)
    }

    pub fn place_bid(
        env: Env,
        bidder: Address,
        auction_id: u32,
        amount: i128,
    ) -> Result<(), ContractError> {
        bidder.require_auth();

        let auction_key = DataKey::Auction(auction_id);
        let mut auction: Auction = env
            .storage()
            .persistent()
            .get(&auction_key)
            .ok_or(ContractError::AuctionNotFound)?;

        if auction.status == AuctionStatus::Ended {
            return Err(ContractError::AuctionEnded);
        }

        let now = env.ledger().timestamp();
        if now >= auction.end_time {
            return Err(ContractError::AuctionExpired);
        }

        if amount <= auction.highest_bid {
            return Err(ContractError::BidTooLow);
        }

        let ledger = env.ledger().sequence();
        let entry = BidEntry {
            bidder: bidder.clone(),
            amount,
            timestamp: now,
            ledger,
        };

        auction.highest_bid = amount;
        auction.highest_bidder = Some(bidder.clone());

        let history_key = DataKey::BidHistory(auction_id);
        let history: Vec<BidEntry> = env
            .storage()
            .persistent()
            .get(&history_key)
            .unwrap_or_else(|| Vec::new(&env));

        let mut new_history = Vec::new(&env);
        new_history.push_back(entry);
        for existing in history.iter() {
            if new_history.len() >= MAX_BID_HISTORY {
                break;
            }
            new_history.push_back(existing);
        }

        env.storage().persistent().set(&auction_key, &auction);
        env.storage()
            .persistent()
            .set(&history_key, &new_history);
        env.storage()
            .persistent()
            .extend_ttl(&auction_key, MIN_TTL, EXTEND_TO);
        env.storage()
            .persistent()
            .extend_ttl(&history_key, MIN_TTL, EXTEND_TO);

        BidPlacedEvent {
            auction_id,
            bidder,
            amount,
            ledger,
        }
        .publish(&env);

        Ok(())
    }

    pub fn finalize_auction(
        env: Env,
        caller: Address,
        auction_id: u32,
    ) -> Result<(), ContractError> {
        caller.require_auth();

        let auction_key = DataKey::Auction(auction_id);
        let mut auction: Auction = env
            .storage()
            .persistent()
            .get(&auction_key)
            .ok_or(ContractError::AuctionNotFound)?;

        if auction.status == AuctionStatus::Ended {
            return Err(ContractError::AuctionEnded);
        }

        let now = env.ledger().timestamp();
        if now < auction.end_time {
            return Err(ContractError::AuctionStillActive);
        }

        auction.status = AuctionStatus::Ended;
        let winner = auction.highest_bidder.clone();

        env.storage().persistent().set(&auction_key, &auction);
        env.storage()
            .persistent()
            .extend_ttl(&auction_key, MIN_TTL, EXTEND_TO);

        AuctionFinalizedEvent {
            auction_id,
            winner,
        }
        .publish(&env);

        Ok(())
    }

    pub fn get_auction(env: Env, auction_id: u32) -> Result<Auction, ContractError> {
        env.storage()
            .persistent()
            .get(&DataKey::Auction(auction_id))
            .ok_or(ContractError::AuctionNotFound)
    }

    pub fn get_auction_count(env: Env) -> u32 {
        env.storage()
            .instance()
            .get(&DataKey::AuctionCount)
            .unwrap_or(0)
    }

    pub fn get_recent_bids(env: Env, auction_id: u32) -> Result<Vec<BidEntry>, ContractError> {
        let _ = env
            .storage()
            .persistent()
            .get::<DataKey, Auction>(&DataKey::Auction(auction_id))
            .ok_or(ContractError::AuctionNotFound)?;

        Ok(env
            .storage()
            .persistent()
            .get(&DataKey::BidHistory(auction_id))
            .unwrap_or_else(|| Vec::new(&env)))
    }
}

mod test;
