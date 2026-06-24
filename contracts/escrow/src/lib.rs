#![no_std]
use soroban_sdk::{
    contract, contracterror, contractevent, contractimpl, contracttype, token, Address, Env,
};

const MIN_TTL: u32 = 17_280;
const EXTEND_TO: u32 = 518_400;

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Admin,
    AuctionContract,
    TokenContract,
    HighestLock(u32),
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct LockRecord {
    pub bidder: Address,
    pub amount: i128,
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum EscrowError {
    Unauthorized = 1,
    AuctionAlreadySet = 2,
    InvalidAmount = 3,
    AuctionNotConfigured = 4,
}

#[contractevent(topics = ["bid_locked"])]
pub struct BidLockedEvent {
    pub auction_id: u32,
    pub bidder: Address,
    pub amount: i128,
}

#[contractevent(topics = ["bid_refunded"])]
pub struct BidRefundedEvent {
    pub auction_id: u32,
    pub bidder: Address,
    pub amount: i128,
}

#[contractevent(topics = ["auction_settled"])]
pub struct AuctionSettledEvent {
    pub auction_id: u32,
    pub seller: Address,
    pub amount: i128,
}

#[contract]
pub struct Contract;

#[contractimpl]
impl Contract {
    pub fn __constructor(env: Env, admin: Address, token_contract: Address) {
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage()
            .instance()
            .set(&DataKey::TokenContract, &token_contract);
        env.storage()
            .instance()
            .extend_ttl(MIN_TTL, EXTEND_TO);
    }

    pub fn set_auction_contract(
        env: Env,
        admin: Address,
        auction: Address,
    ) -> Result<(), EscrowError> {
        admin.require_auth();
        let stored_admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(EscrowError::Unauthorized)?;
        if admin != stored_admin {
            return Err(EscrowError::Unauthorized);
        }
        if env.storage().instance().has(&DataKey::AuctionContract) {
            return Err(EscrowError::AuctionAlreadySet);
        }
        env.storage()
            .instance()
            .set(&DataKey::AuctionContract, &auction);
        env.storage()
            .instance()
            .extend_ttl(MIN_TTL, EXTEND_TO);
        Ok(())
    }

    pub fn lock_bid(
        env: Env,
        auction_id: u32,
        bidder: Address,
        amount: i128,
        previous_bidder: Option<Address>,
        previous_amount: i128,
    ) -> Result<(), EscrowError> {
        Self::require_auction_caller(&env)?;
        bidder.require_auth();

        if amount <= 0 {
            return Err(EscrowError::InvalidAmount);
        }

        let token = Self::token_client(&env);
        let escrow_addr = env.current_contract_address();

        token.transfer(&bidder, &escrow_addr, &amount);

        if let Some(prev) = previous_bidder {
            if previous_amount > 0 {
                token.transfer(&escrow_addr, &prev, &previous_amount);
                BidRefundedEvent {
                    auction_id,
                    bidder: prev,
                    amount: previous_amount,
                }
                .publish(&env);
            }
        }

        let lock_key = DataKey::HighestLock(auction_id);
        env.storage().persistent().set(
            &lock_key,
            &LockRecord {
                bidder: bidder.clone(),
                amount,
            },
        );
        env.storage()
            .persistent()
            .extend_ttl(&lock_key, MIN_TTL, EXTEND_TO);

        BidLockedEvent {
            auction_id,
            bidder,
            amount,
        }
        .publish(&env);

        Ok(())
    }

    pub fn settle(
        env: Env,
        auction_id: u32,
        seller: Address,
        winner: Option<Address>,
        amount: i128,
    ) -> Result<(), EscrowError> {
        Self::require_auction_caller(&env)?;

        if let Some(_winner) = winner {
            if amount > 0 {
                let token = Self::token_client(&env);
                token.transfer(&env.current_contract_address(), &seller, &amount);
            }
        }

        let lock_key = DataKey::HighestLock(auction_id);
        if env.storage().persistent().has(&lock_key) {
            env.storage().persistent().remove(&lock_key);
        }

        AuctionSettledEvent {
            auction_id,
            seller,
            amount,
        }
        .publish(&env);

        Ok(())
    }

    pub fn get_locked_balance(env: Env, auction_id: u32, bidder: Address) -> i128 {
        let lock_key = DataKey::HighestLock(auction_id);
        if let Some(record) = env.storage().persistent().get::<DataKey, LockRecord>(&lock_key) {
            if record.bidder == bidder {
                return record.amount;
            }
        }
        0
    }

    fn require_auction_caller(env: &Env) -> Result<(), EscrowError> {
        let auction: Address = env
            .storage()
            .instance()
            .get(&DataKey::AuctionContract)
            .ok_or(EscrowError::AuctionNotConfigured)?;
        auction.require_auth();
        Ok(())
    }

    fn token_client(env: &Env) -> token::Client<'_> {
        let token_contract: Address = env
            .storage()
            .instance()
            .get(&DataKey::TokenContract)
            .expect("token not configured");
        token::Client::new(env, &token_contract)
    }
}

mod test;
