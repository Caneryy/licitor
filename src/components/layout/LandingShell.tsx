import type { ReactNode } from "react";
import { scrollToSection } from "../../lib/routes";
import { Button } from "../ui/Button";

const SECTION_LINKS = [
  { id: "features", label: "Features" },
  { id: "showcase", label: "Showcase" },
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
      <header className="landing-header sticky top-0 z-50 border-b-2 border-[var(--border)] bg-[var(--surface)]">
        <div className="landing-header-inner mx-auto max-w-6xl px-4 py-4">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="landing-header-brand text-left transition-opacity hover:opacity-80"
            aria-label="Scroll to top"
          >
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent)]">Licitor</p>
            <p className="text-xl font-black sm:text-2xl">Real-time Auction</p>
          </button>

          <nav className="landing-header-nav" aria-label="Landing sections">
            {SECTION_LINKS.map((link) => (
              <Button
                key={link.id}
                type="button"
                variant="ghost"
                className="landing-nav-btn shrink-0"
                onClick={() => scrollToSection(link.id)}
              >
                {link.label}
              </Button>
            ))}
          </nav>

          <div className="landing-header-actions">
            <Button type="button" className="w-full sm:w-auto" onClick={() => onEnterApp("auctions")}>
              Enter app
            </Button>
          </div>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}
