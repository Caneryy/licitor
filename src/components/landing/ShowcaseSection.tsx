import { Button } from "../ui/Button";
import { LANDING_IMAGES } from "../../lib/landingImages";

const SHOWCASE_ITEMS = [
  {
    title: "Vintage Leica M6",
    category: "Photography",
    bid: "42 XLM",
    image: LANDING_IMAGES.items.camera,
    imageAlt: "Vintage Leica M6 camera up for auction",
  },
  {
    title: "Rare vinyl press",
    category: "Music",
    bid: "8.5 XLM",
    image: LANDING_IMAGES.items.vinyl,
    imageAlt: "Rare vinyl record collectible",
  },
  {
    title: "Digital art #204",
    category: "Digital",
    bid: "120 XLM",
    image: LANDING_IMAGES.items.art,
    imageAlt: "Digital art piece listed on Licitor",
  },
] as const;

interface ShowcaseSectionProps {
  onBrowse: () => void;
}

export function ShowcaseSection({ onBrowse }: ShowcaseSectionProps) {
  return (
    <section className="landing-section">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <p className="landing-eyebrow">Showcase</p>
            <h2 className="text-3xl font-black sm:text-4xl">What people are bidding on</h2>
            <p className="mt-3 text-[var(--ink-muted)]">
              From physical collectibles to digital art. Every listing is an on-chain auction with
              live bid tracking.
            </p>
          </div>
          <Button type="button" variant="ghost" onClick={onBrowse}>
            View all auctions
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SHOWCASE_ITEMS.map((item) => (
            <article key={item.title} className="landing-showcase-card neo-card overflow-hidden">
              <figure className="landing-showcase-image">
                <img
                  src={item.image}
                  alt={item.imageAlt}
                  className="h-full w-full object-cover"
                  width={480}
                  height={360}
                  loading="lazy"
                />
              </figure>
              <div className="p-4">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--accent)]">
                  {item.category}
                </p>
                <h3 className="mt-1 text-xl font-black">{item.title}</h3>
                <p className="mt-2 text-sm">
                  Current bid: <strong>{item.bid}</strong>
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
