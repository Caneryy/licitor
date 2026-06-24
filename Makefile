.PHONY: test-contracts build-contracts deploy-testnet integration-test fmt-contracts

test-contracts:
	cargo test -p escrow -p auction

build-contracts:
	CARGO_TARGET_DIR=./target stellar contract build

deploy-testnet:
	chmod +x scripts/deploy-testnet.sh
	./scripts/deploy-testnet.sh

integration-test:
	chmod +x scripts/integration-test.sh
	./scripts/integration-test.sh

fmt-contracts:
	cargo fmt --all
