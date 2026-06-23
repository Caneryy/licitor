import { Button } from "../ui/Button";

interface HeroSectionProps {
  onBrowse: () => void;
  onCreate: () => void;
}

export function HeroSection({ onBrowse, onCreate }: HeroSectionProps) {
  return (
    <section className="landing-hero">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:py-16 lg:grid-cols-[1.2fr_1fr] lg:items-center lg:py-20">
        <div className="space-y-6">
          <p className="landing-eyebrow">On-chain auctions on Stellar</p>
          <h1 className="text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
            Bid in real time.
            <br />
            Own on-chain.
          </h1>
          <p className="max-w-xl text-base text-[var(--ink-muted)] sm:text-lg">
            Licitor is a Soroban-powered auction house where every bid settles on the Stellar
            ledger. Create listings, compete live, and finalize winners with full transparency.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button type="button" onClick={onBrowse}>
              Browse auctions
            </Button>
            <Button type="button" variant="ghost" onClick={onCreate}>
              Create auction
            </Button>
          </div>
          <dl className="grid grid-cols-3 gap-3 pt-2 sm:gap-4">
            <div className="landing-stat">
              <dt className="landing-stat-label">Network</dt>
              <dd className="landing-stat-value">Testnet</dd>
            </div>
            <div className="landing-stat">
              <dt className="landing-stat-label">Settlement</dt>
              <dd className="landing-stat-value">On-chain</dd>
            </div>
            <div className="landing-stat">
              <dt className="landing-stat-label">Updates</dt>
              <dd className="landing-stat-value">Live</dd>
            </div>
          </dl>
        </div>

        <div className="landing-hero-panel neo-card p-4 sm:p-6" aria-hidden="true">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.15em] text-[var(--accent)]">
            Live auction preview
          </p>
          <div className="space-y-3">
            <PreviewRow title="Vintage Leica M6" bid="42 XLM" time="2h 14m" active />
            <PreviewRow title="Rare vinyl press" bid="8.5 XLM" time="38m" />
            <PreviewRow title="Digital art #204" bid="120 XLM" time="Ended" />
          </div>
          <p className="mt-4 border-t-2 border-[var(--border)] pt-4 text-xs text-[var(--ink-muted)]">
            Bids stream from chain events and refresh every few seconds.
          </p>
        </div>
      </div>
    </section>
  );
}

function PreviewRow({
  title,
  bid,
  time,
  active = false,
}: {
  title: string;
  bid: string;
  time: string;
  active?: boolean;
}) {
  return (
    <div className={`landing-preview-row ${active ? "landing-preview-row-active" : ""}`}>
      <div>
        <p className="font-bold">{title}</p>
        <p className="text-xs text-[var(--ink-muted)]">Highest: {bid}</p>
      </div>
      <span className="text-xs font-bold">{time}</span>
    </div>
  );
}
