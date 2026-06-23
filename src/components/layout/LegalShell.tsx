import type { ReactNode } from "react";
import type { LegalPage } from "../../lib/legal";
import { SiteFooter } from "./SiteFooter";

interface LegalShellProps {
  children: ReactNode;
  onGoHome: () => void;
  onEnterApp: (view: "auctions" | "create") => void;
  onLegalPage: (page: LegalPage) => void;
}

export function LegalShell({ children, onGoHome, onEnterApp, onLegalPage }: LegalShellProps) {
  return (
    <div className="min-h-screen bg-[var(--paper)]">
      <header className="border-b-2 border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <button
            type="button"
            onClick={onGoHome}
            className="text-left transition-opacity hover:opacity-80"
            aria-label="Go to home"
          >
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent)]">Licitor</p>
            <p className="text-2xl font-black">Real-time Auction</p>
          </button>
        </div>
      </header>

      <main>{children}</main>

      <SiteFooter
        onEnterApp={onEnterApp}
        onGoHome={onGoHome}
        onLegalPage={onLegalPage}
      />
    </div>
  );
}
