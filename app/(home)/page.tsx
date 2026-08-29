import { AboutSection } from "@/components/organisms/AboutSection";
import { ComprehensiveServicesSection } from "@/components/organisms/ComprehensiveServicesSection";
import { ContactSection } from "@/components/organisms/ContactSection";
import { CoreServicesSection } from "@/components/organisms/CoreServicesSection";
import { ExecutivesLegalitySection } from "@/components/organisms/ExecutiveLegalittySection";
import { HeroSection } from "@/components/organisms/HeroSection";
import { VisionMissionSection } from "@/components/organisms/VisionMisionSection";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <AboutSection />
      <VisionMissionSection />
      <CoreServicesSection />
      <ComprehensiveServicesSection />
      <ExecutivesLegalitySection />
      <ContactSection />
    </main>
  );
}
