import { Button } from "../ui/Button";
import { LANDING_IMAGES } from "../../lib/landingImages";

interface HeroSectionProps {
  onBrowse: () => void;
  onCreate: () => void;
}

const PREVIEW_ITEMS = [
  {
    title: "Vintage Leica M6",
    bid: "42 XLM",
    time: "2h 14m",
    image: LANDING_IMAGES.items.camera,
    active: true,
  },
  {
    title: "Rare vinyl press",
    bid: "8.5 XLM",
    time: "38m",
    image: LANDING_IMAGES.items.vinyl,
  },
  {
    title: "Digital art #204",
    bid: "120 XLM",
    time: "Ended",
    image: LANDING_IMAGES.items.art,
  },
] as const;

export function HeroSection({ onBrowse, onCreate }: HeroSectionProps) {
  return (
    <section className="landing-hero">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:py-16 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:py-20">
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

        <div className="space-y-4">
          <figure className="landing-image-frame neo-card overflow-hidden">
            <img
              src={LANDING_IMAGES.hero}
              alt="Neo-brutalist auction scene with live bidding screens and collectible items"
              className="h-auto w-full object-cover"
              width={800}
              height={600}
              loading="eager"
              fetchPriority="high"
            />
          </figure>

          <div className="landing-hero-panel neo-card p-4 sm:p-5">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.15em] text-[var(--accent)]">
              Live auction preview
            </p>
            <div className="space-y-3">
              {PREVIEW_ITEMS.map((item) => (
                <PreviewRow key={item.title} {...item} />
              ))}
            </div>
            <p className="mt-4 border-t-2 border-[var(--border)] pt-4 text-xs text-[var(--ink-muted)]">
              Bids stream from chain events and refresh every few seconds.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function PreviewRow({
  title,
  bid,
  time,
  image,
  active = false,
}: {
  title: string;
  bid: string;
  time: string;
  image: string;
  active?: boolean;
}) {
  return (
    <div className={`landing-preview-row ${active ? "landing-preview-row-active" : ""}`}>
      <img src={image} alt="" className="landing-preview-thumb" width={56} height={56} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-bold">{title}</p>
        <p className="text-xs text-[var(--ink-muted)]">Highest: {bid}</p>
      </div>
      <span className="shrink-0 text-xs font-bold">{time}</span>
    </div>
  );
}
