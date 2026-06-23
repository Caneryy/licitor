import { Button } from "../ui/Button";

interface CtaSectionProps {
  onBrowse: () => void;
  onCreate: () => void;
}

export function CtaSection({ onBrowse, onCreate }: CtaSectionProps) {
  return (
    <section className="landing-section">
      <div className="mx-auto max-w-6xl px-4">
        <div className="landing-cta neo-card p-6 sm:p-10">
          <div className="mx-auto max-w-2xl text-center">
            <p className="landing-eyebrow justify-center">Get started</p>
            <h2 className="text-3xl font-black sm:text-4xl">Ready to bid or list your first item?</h2>
            <p className="mt-3 text-[var(--ink-muted)]">
              Head into the app and experience real-time on-chain auctions on Stellar testnet.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button type="button" onClick={onBrowse}>
                Browse auctions
              </Button>
              <Button type="button" variant="ghost" onClick={onCreate}>
                Create auction
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
