import { Button } from "../ui/Button";
import { useStellarWallet } from "../../hooks/useStellarWallet";
import { truncateMiddle } from "../../lib/format";

export function ConnectWallet() {
  const { address, connected, isConnecting, connect, disconnect } = useStellarWallet();

  if (connected && address) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-bold">{truncateMiddle(address, 8, 6)}</span>
        <Button variant="ghost" onClick={() => void disconnect()}>
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <Button onClick={() => void connect()} disabled={isConnecting}>
      {isConnecting ? "Connecting…" : "Connect Wallet"}
    </Button>
  );
}
