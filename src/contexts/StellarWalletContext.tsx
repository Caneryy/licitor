import { StellarWalletsKit } from "@creit.tech/stellar-wallets-kit/sdk";
import { FreighterModule } from "@creit.tech/stellar-wallets-kit/modules/freighter";
import { xBullModule } from "@creit.tech/stellar-wallets-kit/modules/xbull";
import { LobstrModule } from "@creit.tech/stellar-wallets-kit/modules/lobstr";
import { KitEventType, Networks } from "@creit.tech/stellar-wallets-kit/types";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { classifyError } from "../lib/errors";
import { config } from "../lib/stellar";
import { isTestnetPassphrase } from "../lib/explorer";

const WALLET_SYNC_INTERVAL_MS = 3000;

let initialized = false;

function ensureKit() {
  if (initialized) return;
  StellarWalletsKit.init({
    network: Networks.TESTNET,
    modules: [new FreighterModule(), new xBullModule(), new LobstrModule()],
  });
  initialized = true;
}

interface StellarWalletContextValue {
  address: string | null;
  connected: boolean;
  isConnecting: boolean;
  networkPassphrase: string | null;
  isTestnet: boolean;
  connect: () => Promise<string>;
  disconnect: () => Promise<void>;
  sign: (xdr: string, expectedSource: string) => Promise<string>;
  refreshWallet: () => Promise<void>;
}

const StellarWalletContext = createContext<StellarWalletContextValue | null>(null);

function applyWalletPayload(
  setAddress: (value: string | null) => void,
  setConnected: (value: boolean) => void,
  setNetworkPassphrase: (value: string | null) => void,
  nextAddress: string | undefined,
  nextPassphrase?: string,
) {
  setAddress(nextAddress ?? null);
  setConnected(Boolean(nextAddress));
  if (nextPassphrase) {
    setNetworkPassphrase(nextPassphrase);
  }
}

export function StellarWalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [networkPassphrase, setNetworkPassphrase] = useState<string | null>(null);

  const refreshWallet = useCallback(async () => {
    ensureKit();
    try {
      const [{ address: liveAddress }, network] = await Promise.all([
        StellarWalletsKit.fetchAddress(),
        StellarWalletsKit.getNetwork(),
      ]);
      applyWalletPayload(setAddress, setConnected, setNetworkPassphrase, liveAddress, network.networkPassphrase);
      return;
    } catch {
      // Fall back to cached kit address when live fetch is unavailable.
    }

    try {
      const [{ address: cachedAddress }, network] = await Promise.all([
        StellarWalletsKit.getAddress(),
        StellarWalletsKit.getNetwork(),
      ]);
      applyWalletPayload(
        setAddress,
        setConnected,
        setNetworkPassphrase,
        cachedAddress,
        network.networkPassphrase,
      );
    } catch {
      setAddress(null);
      setConnected(false);
    }
  }, []);

  useEffect(() => {
    ensureKit();

    const onStateUpdated = StellarWalletsKit.on(KitEventType.STATE_UPDATED, (event) => {
      applyWalletPayload(
        setAddress,
        setConnected,
        setNetworkPassphrase,
        event.payload.address,
        event.payload.networkPassphrase,
      );
    });

    const onWalletSelected = StellarWalletsKit.on(KitEventType.WALLET_SELECTED, () => {
      void refreshWallet();
    });

    const onDisconnect = StellarWalletsKit.on(KitEventType.DISCONNECT, () => {
      setAddress(null);
      setConnected(false);
    });

    void refreshWallet();

    return () => {
      onStateUpdated();
      onWalletSelected();
      onDisconnect();
    };
  }, [refreshWallet]);

  useEffect(() => {
    if (!connected) return undefined;

    const timer = window.setInterval(() => {
      void refreshWallet();
    }, WALLET_SYNC_INTERVAL_MS);

    const onFocus = () => {
      void refreshWallet();
    };
    const onVisibility = () => {
      if (!document.hidden) void refreshWallet();
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [connected, refreshWallet]);

  const connect = useCallback(async () => {
    ensureKit();
    setIsConnecting(true);
    try {
      const { address: nextAddress } = await StellarWalletsKit.authModal();
      const network = await StellarWalletsKit.getNetwork();
      if (!isTestnetPassphrase(network.networkPassphrase)) {
        throw new Error("wrong_network");
      }
      applyWalletPayload(setAddress, setConnected, setNetworkPassphrase, nextAddress, network.networkPassphrase);
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

  const sign = useCallback(async (xdr: string, expectedSource: string) => {
    ensureKit();

    const network = await StellarWalletsKit.getNetwork();
    if (!isTestnetPassphrase(network.networkPassphrase)) {
      throw classifyError(new Error("wrong_network"));
    }

    const { address: signerAddress } = await StellarWalletsKit.fetchAddress();
    if (signerAddress !== expectedSource) {
      throw classifyError(new Error("wallet_address_mismatch"));
    }

    applyWalletPayload(setAddress, setConnected, setNetworkPassphrase, signerAddress, network.networkPassphrase);

    const { signedTxXdr } = await StellarWalletsKit.signTransaction(xdr, {
      networkPassphrase: config.networkPassphrase,
      address: signerAddress,
    });

    if (!signedTxXdr) {
      throw classifyError(new Error("tx_not_signed"));
    }

    void refreshWallet();
    return signedTxXdr;
  }, [refreshWallet]);

  const isTestnet = networkPassphrase ? isTestnetPassphrase(networkPassphrase) : true;

  const value = useMemo(
    () => ({
      address,
      connected,
      isConnecting,
      networkPassphrase,
      isTestnet,
      connect,
      disconnect,
      sign,
      refreshWallet,
    }),
    [address, connected, isConnecting, networkPassphrase, isTestnet, connect, disconnect, sign, refreshWallet],
  );

  return <StellarWalletContext.Provider value={value}>{children}</StellarWalletContext.Provider>;
}

export function useStellarWalletContext(): StellarWalletContextValue {
  const context = useContext(StellarWalletContext);
  if (!context) {
    throw new Error("useStellarWallet must be used within StellarWalletProvider");
  }
  return context;
}
