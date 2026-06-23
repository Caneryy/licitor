import type { LegalPage } from "../lib/legal";
import { LEGAL_CONTENT } from "../lib/legal";
import { Button } from "../components/ui/Button";

interface LegalPageViewProps {
  page: LegalPage;
  onGoHome: () => void;
}

export function LegalPageView({ page, onGoHome }: LegalPageViewProps) {
  const document = LEGAL_CONTENT[page];

  return (
    <article className="legal-page mx-auto max-w-3xl px-4 py-10 sm:py-14">
      <Button type="button" variant="ghost" onClick={onGoHome}>
        ← Back to home
      </Button>

      <header className="mt-6 space-y-3 border-b-2 border-[var(--border)] pb-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent)]">Legal</p>
        <h1 className="text-3xl font-black sm:text-4xl">{document.title}</h1>
        <p className="text-[var(--ink-muted)]">{document.description}</p>
        <p className="text-sm text-[var(--ink-muted)]">Last updated: {document.lastUpdated}</p>
      </header>

      <div className="mt-8 space-y-8">
        {document.sections.map((section) => (
          <section key={section.title} className="legal-section">
            <h2 className="text-xl font-black">{section.title}</h2>
            <div className="mt-3 space-y-3 text-sm leading-relaxed text-[var(--ink-muted)]">
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {section.list && (
                <ul className="list-disc space-y-2 pl-5">
                  {section.list.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        ))}
      </div>
    </article>
  );
}
