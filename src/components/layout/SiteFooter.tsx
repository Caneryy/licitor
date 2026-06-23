import type { LegalPage } from "../../lib/legal";
import { LEGAL_PAGES } from "../../lib/legal";
import { scrollToSection } from "../../lib/routes";
import { Button } from "../ui/Button";

interface SiteFooterProps {
  onEnterApp: (view: "auctions" | "create") => void;
  onGoHome: () => void;
  onLegalPage: (page: LegalPage) => void;
  showSectionLinks?: boolean;
}

const PRODUCT_LINKS = [
  { label: "Browse auctions", action: "auctions" as const },
  { label: "Create auction", action: "create" as const },
  { label: "Features", section: "features" },
  { label: "Showcase", section: "showcase" },
  { label: "FAQ", section: "faq" },
] as const;

const RESOURCE_LINKS = [
  { label: "Stellar", href: "https://stellar.org" },
  { label: "Developers", href: "https://developers.stellar.org" },
  { label: "Soroban docs", href: "https://soroban.stellar.org/docs" },
  { label: "Stellar Expert", href: "https://stellar.expert" },
] as const;

export function SiteFooter({
  onEnterApp,
  onGoHome,
  onLegalPage,
  showSectionLinks = false,
}: SiteFooterProps) {
  const year = new Date().getFullYear();

  const handleSection = (section: string) => {
    if (showSectionLinks) {
      scrollToSection(section);
      return;
    }
    onGoHome();
    window.setTimeout(() => scrollToSection(section), 50);
  };

  return (
    <footer className="site-footer">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <button
              type="button"
              className="site-footer-brand text-left"
              onClick={onGoHome}
            >
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent)]">Licitor</p>
              <p className="mt-1 text-2xl font-black text-[var(--paper)]">Real-time Auction</p>
            </button>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-[var(--paper-muted)]">
              A Soroban dApp for creating, bidding on, and finalizing auctions with full on-chain
              transparency on Stellar testnet.
            </p>
            <div className="mt-5">
              <Button type="button" onClick={() => onEnterApp("auctions")}>
                Launch app
              </Button>
            </div>
          </div>

          <div className="lg:col-span-2">
            <h3 className="site-footer-heading">Product</h3>
            <ul className="site-footer-list">
              {PRODUCT_LINKS.map((link) => (
                <li key={link.label}>
                  {"action" in link ? (
                    <button
                      type="button"
                      className="site-footer-link"
                      onClick={() => onEnterApp(link.action)}
                    >
                      {link.label}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="site-footer-link"
                      onClick={() => handleSection(link.section)}
                    >
                      {link.label}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h3 className="site-footer-heading">Legal</h3>
            <ul className="site-footer-list">
              {(Object.keys(LEGAL_PAGES) as LegalPage[]).map((page) => (
                <li key={page}>
                  <button
                    type="button"
                    className="site-footer-link"
                    onClick={() => onLegalPage(page)}
                  >
                    {LEGAL_PAGES[page].label}
                  </button>
                </li>
              ))}
              <li>
                <a href="mailto:legal@licitor.app" className="site-footer-link">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h3 className="site-footer-heading">Resources</h3>
            <ul className="site-footer-list">
              {RESOURCE_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="site-footer-link"
                  >
                    {link.label} ↗
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-6 rounded-none border-2 border-[var(--paper-muted)] p-3 text-sm text-[var(--paper-muted)]">
              <p className="font-bold text-[var(--paper)]">Stellar Testnet</p>
              <p className="mt-1">Test XLM only. Not financial advice.</p>
            </div>
          </div>
        </div>

        <div className="site-footer-bottom mt-10 flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[var(--paper-muted)]">
            © {year} Licitor. All rights reserved.
          </p>
          <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm" aria-label="Legal links">
            {(Object.keys(LEGAL_PAGES) as LegalPage[]).map((page) => (
              <button
                key={page}
                type="button"
                className="site-footer-link"
                onClick={() => onLegalPage(page)}
              >
                {LEGAL_PAGES[page].label}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
