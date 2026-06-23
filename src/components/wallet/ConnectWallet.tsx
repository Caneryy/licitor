import { Button } from "../ui/Button";
import { useStellarWallet } from "../../hooks/useStellarWallet";

export function ConnectWallet() {
  const { connected, isConnecting, connect, disconnect } = useStellarWallet();

  if (connected) {
    return (
      <Button variant="ghost" onClick={() => void disconnect()}>
        Disconnect
      </Button>
    );
  }

  return (
    <Button onClick={() => void connect()} disabled={isConnecting}>
      {isConnecting ? "Connecting…" : "Connect Wallet"}
    </Button>
  );
}
