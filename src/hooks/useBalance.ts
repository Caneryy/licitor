import { useCallback, useEffect, useState } from "react";
import { getNativeBalance } from "../lib/balance";
import { formatTokenWithSymbol } from "../lib/format";
import { MIN_FEE_XLM } from "../lib/stellar";
import { getUsdcBalance, hasUsdcTrustline } from "../lib/token";

export function useBalance(address: string | null) {
  const [balance, setBalance] = useState<number | null>(null);
  const [tokenBalance, setTokenBalance] = useState<bigint | null>(null);
  const [hasTrustline, setHasTrustline] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!address) {
      setBalance(null);
      setTokenBalance(null);
      setHasTrustline(null);
      return;
    }
    setLoading(true);
    try {
      const [xlm, usdc, trustline] = await Promise.all([
        getNativeBalance(address),
        getUsdcBalance(address).catch(() => null),
        hasUsdcTrustline(address).catch(() => false),
      ]);
      setBalance(xlm);
      setTokenBalance(usdc);
      setHasTrustline(trustline);
    } catch {
      setBalance(null);
      setTokenBalance(null);
      setHasTrustline(null);
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!address) return undefined;

    const refreshOnReturn = () => {
      void refresh();
    };
    const onVisibility = () => {
      if (!document.hidden) refreshOnReturn();
    };

    window.addEventListener("focus", refreshOnReturn);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("focus", refreshOnReturn);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [address, refresh]);

  const hasTokenBalance = useCallback(
    (required: bigint) => tokenBalance !== null && tokenBalance >= required,
    [tokenBalance],
  );

  return {
    balance,
    tokenBalance,
    tokenBalanceLabel:
      tokenBalance !== null ? formatTokenWithSymbol(tokenBalance) : null,
    hasTrustline,
    loading,
    hasFeeBalance: balance !== null ? balance >= MIN_FEE_XLM : false,
    hasTokenBalance,
    refresh,
  };
}
