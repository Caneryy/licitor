import type { ReactNode } from "react";
import { scrollToSection } from "../../lib/routes";
import { Button } from "../ui/Button";
import { ConnectWallet } from "../wallet/ConnectWallet";
import { WalletBar } from "./WalletBar";

const SECTION_LINKS = [
  { id: "features", label: "Features" },
  { id: "how-it-works", label: "How it works" },
  { id: "technology", label: "Technology" },
  { id: "faq", label: "FAQ" },
] as const;

interface LandingShellProps {
  children: ReactNode;
  onEnterApp: (view: "auctions" | "create") => void;
}

export function LandingShell({ children, onEnterApp }: LandingShellProps) {
  return (
    <div className="min-h-screen bg-[var(--paper)]">
      <header className="sticky top-0 z-50 border-b-2 border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="text-left transition-opacity hover:opacity-80"
            aria-label="Scroll to top"
          >
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent)]">Licitor</p>
            <p className="text-2xl font-black sm:text-3xl">Real-time Auction</p>
          </button>

          <nav
            className="flex flex-wrap gap-x-4 gap-y-2 text-sm font-bold"
            aria-label="Landing sections"
          >
            {SECTION_LINKS.map((link) => (
              <button
                key={link.id}
                type="button"
                className="landing-nav-link"
                onClick={() => scrollToSection(link.id)}
              >
                {link.label}
              </button>
            ))}
          </nav>

          <div className="flex flex-wrap items-center gap-2">
            <ConnectWallet />
            <Button type="button" onClick={() => onEnterApp("auctions")}>
              Enter app
            </Button>
          </div>
        </div>
        <WalletBar />
      </header>

      <main>{children}</main>
    </div>
  );
}
