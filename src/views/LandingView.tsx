import { LandingShell } from "../components/layout/LandingShell";
import { CtaSection } from "../components/landing/CtaSection";
import { FaqSection } from "../components/landing/FaqSection";
import { FeaturesSection } from "../components/landing/FeaturesSection";
import { Footer } from "../components/landing/Footer";
import { HeroSection } from "../components/landing/HeroSection";
import { HowItWorksSection } from "../components/landing/HowItWorksSection";
import { ShowcaseSection } from "../components/landing/ShowcaseSection";
import { TechnologySection } from "../components/landing/TechnologySection";

interface LandingViewProps {
  onEnterApp: (view: "auctions" | "create") => void;
}

export function LandingView({ onEnterApp }: LandingViewProps) {
  return (
    <LandingShell onEnterApp={onEnterApp}>
      <HeroSection onBrowse={() => onEnterApp("auctions")} onCreate={() => onEnterApp("create")} />
      <FeaturesSection />
      <ShowcaseSection onBrowse={() => onEnterApp("auctions")} />
      <HowItWorksSection />
      <TechnologySection />
      <FaqSection />
      <CtaSection onBrowse={() => onEnterApp("auctions")} onCreate={() => onEnterApp("create")} />
      <Footer onEnterApp={onEnterApp} />
    </LandingShell>
  );
}
