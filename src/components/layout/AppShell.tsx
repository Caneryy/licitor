import type { ReactNode } from "react";
import type { AppView } from "../../lib/types";
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
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent)]">Licitor</p>
            <h1 className="text-3xl font-black">Real-time Auction</h1>
          </div>
          <nav className="flex flex-wrap gap-2">
            {NAV.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`border-2 border-[var(--border)] px-4 py-2 font-bold ${
                  view === item.id ? "bg-[var(--accent)] text-white" : "bg-[var(--surface)]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
          <ConnectWallet />
        </div>
        <WalletBar />
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
