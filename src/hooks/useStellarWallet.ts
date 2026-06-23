import { StellarWalletsKit } from "@creit.tech/stellar-wallets-kit/sdk";
import { FreighterModule } from "@creit.tech/stellar-wallets-kit/modules/freighter";
import { xBullModule } from "@creit.tech/stellar-wallets-kit/modules/xbull";
import { LobstrModule } from "@creit.tech/stellar-wallets-kit/modules/lobstr";
import { KitEventType, Networks } from "@creit.tech/stellar-wallets-kit/types";
import { useCallback, useEffect, useState } from "react";
import { classifyError } from "../lib/errors";
import { config } from "../lib/stellar";
import { isTestnetPassphrase } from "../lib/explorer";

let initialized = false;

function ensureKit() {
  if (initialized) return;
  StellarWalletsKit.init({
    network: Networks.TESTNET,
    modules: [new FreighterModule(), new xBullModule(), new LobstrModule()],
  });
  initialized = true;
}

export function useStellarWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [networkPassphrase, setNetworkPassphrase] = useState<string | null>(null);

  useEffect(() => {
    ensureKit();
    const unsubscribe = StellarWalletsKit.on(KitEventType.STATE_UPDATED, (event) => {
      setAddress(event.payload.address ?? null);
      setConnected(Boolean(event.payload.address));
      setNetworkPassphrase(event.payload.networkPassphrase);
    });

    void (async () => {
      try {
        const { address: current } = await StellarWalletsKit.getAddress();
        if (current) {
          setAddress(current);
          setConnected(true);
        }
        const network = await StellarWalletsKit.getNetwork();
        setNetworkPassphrase(network.networkPassphrase);
      } catch {
        // No persisted wallet session.
      }
    })();

    return unsubscribe;
  }, []);

  const connect = useCallback(async () => {
    ensureKit();
    setIsConnecting(true);
    try {
      const { address: nextAddress } = await StellarWalletsKit.authModal();
      const network = await StellarWalletsKit.getNetwork();
      if (!isTestnetPassphrase(network.networkPassphrase)) {
        throw new Error("wrong_network");
      }
      setAddress(nextAddress);
      setConnected(true);
      setNetworkPassphrase(network.networkPassphrase);
      return nextAddress;
    } catch (error) {
      throw classifyError(error);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    await StellarWalletsKit.disconnect();
    setAddress(null);
    setConnected(false);
  }, []);

  const sign = useCallback(
    async (xdr: string) => {
      if (!address) throw classifyError(new Error("wallet_not_found"));
      const { signedTxXdr } = await StellarWalletsKit.signTransaction(xdr, {
        networkPassphrase: config.networkPassphrase,
        address,
      });
      return signedTxXdr;
    },
    [address],
  );

  const isTestnet = networkPassphrase ? isTestnetPassphrase(networkPassphrase) : true;

  return {
    address,
    connected,
    isConnecting,
    networkPassphrase,
    isTestnet,
    connect,
    disconnect,
    sign,
  };
}
