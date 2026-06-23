const FAQ = [
  {
    question: "Do I need an account to use Licitor?",
    answer:
      "No. You only need a Stellar wallet like Freighter connected to testnet. Your wallet address is your identity on the platform.",
  },
  {
    question: "Is this mainnet or testnet?",
    answer:
      "Licitor currently runs on Stellar testnet. Use testnet XLM from a faucet. Do not send real funds expecting mainnet value.",
  },
  {
    question: "How are bids validated?",
    answer:
      "The Soroban contract rejects any bid that is not strictly higher than the current highest offer. The UI also enforces minimum amounts before you sign.",
  },
  {
    question: "What happens when an auction ends?",
    answer:
      "Bidding closes when the timer expires. The seller must call finalize on-chain to settle the auction and record the final state.",
  },
  {
    question: "Can I share an auction with others?",
    answer:
      "Yes. Each auction has a dedicated URL. Copy the share link on the detail page and send it to potential bidders.",
  },
] as const;

export function FaqSection() {
  return (
    <section id="faq" className="landing-section landing-section-alt">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-10 max-w-2xl">
          <p className="landing-eyebrow">FAQ</p>
          <h2 className="text-3xl font-black sm:text-4xl">Common questions</h2>
          <p className="mt-3 text-[var(--ink-muted)]">
            Quick answers before you connect your wallet and jump into the app.
          </p>
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          {FAQ.map((item) => (
            <details key={item.question} className="landing-faq-item neo-card group">
              <summary className="cursor-pointer list-none p-4 font-bold marker:content-none sm:p-5">
                <span className="flex items-start justify-between gap-3">
                  {item.question}
                  <span className="landing-faq-chevron" aria-hidden="true">
                    +
                  </span>
                </span>
              </summary>
              <p className="border-t-2 border-[var(--border)] px-4 pb-4 text-sm text-[var(--ink-muted)] sm:px-5 sm:pb-5">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
