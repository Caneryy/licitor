import type { ReactNode } from "react";
import type { AppView } from "../../lib/types";
import { Button } from "../ui/Button";
import { ConnectWallet } from "../wallet/ConnectWallet";
import { WalletBar } from "./WalletBar";

const NAV: { id: AppView; label: string }[] = [
  { id: "auctions", label: "Auctions" },
  { id: "create", label: "Create" },
];

interface AppShellProps {
  view: AppView;
  onNavigate: (view: AppView) => void;
  children: ReactNode;
}

export function AppShell({ view, onNavigate, children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[var(--paper)]">
      <header className="border-b-2 border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between">
          <button
            type="button"
            onClick={() => onNavigate("auctions")}
            className="text-left transition-opacity hover:opacity-80"
            aria-label="Go to home"
          >
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent)]">Licitor</p>
            <h1 className="text-3xl font-black">Real-time Auction</h1>
          </button>
          <nav className="flex flex-wrap gap-2" aria-label="Main navigation">
            {NAV.map((item) => {
              const isActive = view === item.id || (view === "detail" && item.id === "auctions");
              return (
                <Button
                  key={item.id}
                  type="button"
                  variant={isActive ? "primary" : "ghost"}
                  onClick={() => onNavigate(item.id)}
                  aria-current={isActive ? "page" : undefined}
                >
                  {item.label}
                </Button>
              );
            })}
          </nav>
          <ConnectWallet />
        </div>
        <WalletBar />
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
