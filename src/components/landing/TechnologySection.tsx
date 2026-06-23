const STACK = [
  {
    label: "Blockchain",
    value: "Stellar Testnet",
    detail: "Fast finality, low fees, ideal for iterative auction testing.",
  },
  {
    label: "Smart contracts",
    value: "Soroban (Rust)",
    detail: "Auction logic, bid validation, and finalization run on-chain.",
  },
  {
    label: "Wallet",
    value: "Freighter",
    detail: "Sign create, bid, and finalize transactions directly from the browser.",
  },
  {
    label: "Data layer",
    value: "Soroban RPC",
    detail: "Live bid events and auction state are read from the network in real time.",
  },
] as const;

export function TechnologySection() {
  return (
    <section id="technology" className="landing-section">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-start">
          <div>
            <p className="landing-eyebrow">Technology</p>
            <h2 className="text-3xl font-black sm:text-4xl">Powered by the Stellar stack</h2>
            <p className="mt-3 text-[var(--ink-muted)]">
              Licitor is a decentralized application. The UI is a window into Soroban contract
              state. Nothing critical happens off-chain.
            </p>
            <div className="landing-accent-card mt-6 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.15em]">Why Stellar?</p>
              <p className="mt-2 text-sm leading-relaxed">
                Sub-second confirmation, predictable fees, and a mature wallet ecosystem make Stellar
                a strong fit for real-time marketplaces and auction flows.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {STACK.map((item) => (
              <article key={item.label} className="landing-tech-card neo-card p-4">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--ink-muted)]">
                  {item.label}
                </p>
                <p className="mt-1 text-lg font-black">{item.value}</p>
                <p className="mt-2 text-sm text-[var(--ink-muted)]">{item.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
