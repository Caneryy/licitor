import { LANDING_IMAGES } from "../../lib/landingImages";

const STEPS = [
  {
    step: "01",
    title: "Connect your wallet",
    description:
      "Link Freighter on Stellar testnet. Your address and balance appear in the header so you are ready to transact.",
    image: LANDING_IMAGES.steps.wallet,
    imageAlt: "Connecting a Stellar wallet on laptop",
  },
  {
    step: "02",
    title: "Create or place a bid",
    description:
      "Sellers set a title, starting bid, and duration. Bidders enter an amount above the current highest offer and sign on-chain.",
    image: LANDING_IMAGES.steps.bid,
    imageAlt: "Placing a live bid on an auction screen",
  },
  {
    step: "03",
    title: "Finalize the winner",
    description:
      "When the timer ends, the seller finalizes the auction on-chain. The winning bid and auction status are recorded permanently.",
    image: LANDING_IMAGES.steps.finalize,
    imageAlt: "Finalizing an auction with an on-chain gavel",
  },
] as const;

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="landing-section landing-section-alt">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-10 max-w-2xl">
          <p className="landing-eyebrow">How it works</p>
          <h2 className="text-3xl font-black sm:text-4xl">Three steps from wallet to winner</h2>
          <p className="mt-3 text-[var(--ink-muted)]">
            No accounts, no passwords. Just your Stellar wallet and a few signed transactions.
          </p>
        </div>

        <ol className="grid gap-4 lg:grid-cols-3">
          {STEPS.map((item) => (
            <li key={item.step} className="landing-step-card neo-card overflow-hidden">
              <figure className="landing-step-image">
                <img
                  src={item.image}
                  alt={item.imageAlt}
                  className="h-full w-full object-cover"
                  width={400}
                  height={280}
                  loading="lazy"
                />
              </figure>
              <div className="p-5">
                <span className="landing-step-number">{item.step}</span>
                <h3 className="mt-4 text-xl font-black">{item.title}</h3>
                <p className="mt-2 text-sm text-[var(--ink-muted)]">{item.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
