import type { LegalPage } from "../lib/legal";
import { LandingShell } from "../components/layout/LandingShell";
import { SiteFooter } from "../components/layout/SiteFooter";
import { CtaSection } from "../components/landing/CtaSection";
import { FaqSection } from "../components/landing/FaqSection";
import { FeaturesSection } from "../components/landing/FeaturesSection";
import { HeroSection } from "../components/landing/HeroSection";
import { HowItWorksSection } from "../components/landing/HowItWorksSection";
import { ShowcaseSection } from "../components/landing/ShowcaseSection";
import { TechnologySection } from "../components/landing/TechnologySection";

interface LandingViewProps {
  onEnterApp: (view: "auctions" | "create") => void;
  onGoHome: () => void;
  onLegalPage: (page: LegalPage) => void;
}

export function LandingView({ onEnterApp, onGoHome, onLegalPage }: LandingViewProps) {
  return (
    <LandingShell onEnterApp={onEnterApp}>
      <HeroSection onBrowse={() => onEnterApp("auctions")} onCreate={() => onEnterApp("create")} />
      <FeaturesSection />
      <ShowcaseSection onBrowse={() => onEnterApp("auctions")} />
      <HowItWorksSection />
      <TechnologySection />
      <FaqSection />
      <CtaSection onBrowse={() => onEnterApp("auctions")} onCreate={() => onEnterApp("create")} />
      <SiteFooter
        onEnterApp={onEnterApp}
        onGoHome={onGoHome}
        onLegalPage={onLegalPage}
        showSectionLinks
      />
    </LandingShell>
  );
}
