import { useState } from "react";
import { Input } from "../ui/Input";
import { ErrorBanner } from "../feedback/ErrorBanner";
import { TxStatusButton } from "../feedback/TxStatusButton";
import { TxSuccessCard } from "../feedback/TxSuccessCard";
import { useSubmitAction } from "../../hooks/useSubmitAction";
import { useStellarWallet } from "../../hooks/useStellarWallet";
import { useBalance } from "../../hooks/useBalance";
import {
  buildCreateAuctionArgs,
  parseCreateAuctionResult,
} from "../../lib/auction";
import { validationErrors } from "../../lib/errors";
import { xlmToStroops } from "../../lib/format";

interface CreateAuctionFormProps {
  onCreated: (auctionId: number) => void;
}

export function CreateAuctionForm({ onCreated }: CreateAuctionFormProps) {
  const { address, connected, sign } = useStellarWallet();
  const { hasFeeBalance } = useBalance(address);
  const { phase, error, txHash, run, reset } = useSubmitAction();

  const [title, setTitle] = useState("");
  const [startingBid, setStartingBid] = useState("1");
  const [durationMinutes, setDurationMinutes] = useState("30");
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLocalError(null);
    if (!connected || !address) {
      setLocalError("Connect a wallet first.");
      return;
    }
    if (!title.trim()) {
      setLocalError(validationErrors.invalidTitle.message);
      return;
    }
    if (!hasFeeBalance) {
      setLocalError("Insufficient XLM for transaction fees.");
      return;
    }

    try {
      const result = await run({
        sourceAddress: address,
        method: "create_auction",
        args: buildCreateAuctionArgs(
          address,
          title.trim(),
          xlmToStroops(startingBid),
          Number(durationMinutes) * 60,
        ),
        sign,
      });
      const auctionId = parseCreateAuctionResult(result.returnValue);
      onCreated(auctionId);
    } catch {
      // Error state handled by hook.
    }
  };

  const disabled = phase === "signing" || phase === "submitting" || phase === "confirming";

  return (
    <form
      className="neo-card space-y-4 p-4"
      onSubmit={(event) => {
        event.preventDefault();
        void handleSubmit();
      }}
    >
      <h2 className="text-2xl font-black">Create Auction</h2>
      <ErrorBanner message={localError ?? error?.message ?? ""} onDismiss={() => setLocalError(null)} />

      <label className="block space-y-2 text-sm font-bold">
        Title
        <Input value={title} onChange={(e) => setTitle(e.target.value)} disabled={disabled} />
      </label>

      <label className="block space-y-2 text-sm font-bold">
        Starting bid (XLM)
        <Input value={startingBid} onChange={(e) => setStartingBid(e.target.value)} disabled={disabled} />
      </label>

      <label className="block space-y-2 text-sm font-bold">
        Duration (minutes)
        <Input
          value={durationMinutes}
          onChange={(e) => setDurationMinutes(e.target.value)}
          disabled={disabled}
        />
      </label>

      {phase === "success" && txHash ? (
        <TxSuccessCard hash={txHash} onReset={reset} />
      ) : (
        <TxStatusButton phase={phase} idleLabel="Create auction" onClick={() => void handleSubmit()} />
      )}
    </form>
  );
}
