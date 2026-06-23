import { scrollToSection } from "../../lib/routes";

interface FooterProps {
  onEnterApp: (view: "auctions" | "create") => void;
}

const PRODUCT_LINKS = [
  { label: "Browse auctions", action: "auctions" as const },
  { label: "Create auction", action: "create" as const },
  { label: "Features", section: "features" },
  { label: "How it works", section: "how-it-works" },
] as const;

const RESOURCE_LINKS = [
  { label: "Stellar", href: "https://stellar.org" },
  { label: "Developers", href: "https://developers.stellar.org" },
  { label: "Soroban docs", href: "https://soroban.stellar.org/docs" },
  { label: "Stellar Expert", href: "https://stellar.expert" },
] as const;

export function Footer({ onEnterApp }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="landing-footer">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent)]">Licitor</p>
            <p className="mt-2 text-2xl font-black">Real-time Auction</p>
            <p className="mt-3 max-w-xs text-sm text-[var(--ink-muted)]">
              A Soroban dApp for creating, bidding on, and finalizing auctions with full on-chain
              transparency.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.12em]">Product</h3>
            <ul className="mt-4 space-y-2">
              {PRODUCT_LINKS.map((link) => (
                <li key={link.label}>
                  {"action" in link ? (
                    <button
                      type="button"
                      className="landing-footer-link"
                      onClick={() => onEnterApp(link.action)}
                    >
                      {link.label}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="landing-footer-link"
                      onClick={() => scrollToSection(link.section)}
                    >
                      {link.label}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.12em]">Resources</h3>
            <ul className="mt-4 space-y-2">
              {RESOURCE_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="landing-footer-link"
                  >
                    {link.label} ↗
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.12em]">Network</h3>
            <ul className="mt-4 space-y-2 text-sm text-[var(--ink-muted)]">
              <li>
                <span className="font-bold text-[var(--ink)]">Stellar Testnet</span>
              </li>
              <li>Test XLM only. Not financial advice.</li>
              <li>Contract-enforced auction rules.</li>
              <li>
                <button
                  type="button"
                  className="landing-footer-link"
                  onClick={() => scrollToSection("faq")}
                >
                  Read FAQ
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="landing-footer-bottom mt-10 flex flex-col gap-4 border-t-2 border-[var(--border)] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[var(--ink-muted)]">
            © {year} Licitor. Built on Stellar. Open for testnet experimentation.
          </p>
          <div className="flex flex-wrap gap-4 text-sm">
            <button
              type="button"
              className="landing-footer-link"
              onClick={() => scrollToSection("technology")}
            >
              Technology
            </button>
            <button
              type="button"
              className="landing-footer-link"
              onClick={() => onEnterApp("auctions")}
            >
              Launch app
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
