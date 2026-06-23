const FEATURES = [
  {
    icon: "01",
    title: "Live bidding",
    description:
      "Bid history and highest offers update in real time via Soroban RPC polling and on-chain events.",
  },
  {
    icon: "02",
    title: "On-chain settlement",
    description:
      "Auction rules, bids, and finalization are enforced by a Soroban smart contract. No off-chain trust required.",
  },
  {
    icon: "03",
    title: "Wallet-native",
    description:
      "Connect with Freighter, sign transactions yourself, and keep custody of your assets at all times.",
  },
  {
    icon: "04",
    title: "Full transparency",
    description:
      "Every bid links to Stellar Expert. Sellers, bidders, and observers can verify activity on the ledger.",
  },
  {
    icon: "05",
    title: "Shareable listings",
    description:
      "Each auction has a unique URL you can copy and share so others can join the bidding instantly.",
  },
  {
    icon: "06",
    title: "Clear auction phases",
    description:
      "Live, bidding closed, and finalized states are shown clearly so you always know what action is available.",
  },
] as const;

export function FeaturesSection() {
  return (
    <section id="features" className="landing-section">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-10 max-w-2xl">
          <p className="landing-eyebrow">Features</p>
          <h2 className="text-3xl font-black sm:text-4xl">Built for competitive, transparent bidding</h2>
          <p className="mt-3 text-[var(--ink-muted)]">
            Licitor combines a fast web experience with Stellar&apos;s low-fee, high-speed ledger.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <article key={feature.title} className="landing-feature-card neo-card p-5">
              <span className="landing-feature-icon" aria-hidden="true">
                {feature.icon}
              </span>
              <h3 className="mt-4 text-xl font-black">{feature.title}</h3>
              <p className="mt-2 text-sm text-[var(--ink-muted)]">{feature.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
