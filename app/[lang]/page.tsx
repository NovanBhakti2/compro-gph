import type { Metadata } from "next";
import { AboutSection } from "@/components/organisms/AboutSection";
import { ComprehensiveServicesSection } from "@/components/organisms/ComprehensiveServicesSection";
import { ContactSection } from "@/components/organisms/ContactSection";
import { CoreServicesSection } from "@/components/organisms/CoreServicesSection";
import { ExecutivesLegalitySection } from "@/components/organisms/ExecutiveLegalittySection";
import { HeroSection } from "@/components/organisms/HeroSection";
import { VisionMissionSection } from "@/components/organisms/VisionMisionSection";
import { getDictionary, isLocale, languageAlternates, localizePath } from "@/lib/i18n";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const path = isLocale(lang) ? localizePath(lang, "/") : "/";
  return {
    alternates: { canonical: path, languages: languageAlternates("/") },
  };
}

export default async function HomePage({ params }: Props) {
  const { lang } = await params;
  const dict = getDictionary(lang);

  return (
    <main className="min-h-screen">
      <HeroSection dict={dict.hero} />
      <AboutSection dict={dict.about} />
      <VisionMissionSection dict={dict.vision} />
      <CoreServicesSection dict={dict.coreServices} />
      <ComprehensiveServicesSection dict={dict.expertise} />
      <ExecutivesLegalitySection dict={dict.team} />
      <ContactSection dict={dict.contact} />
    </main>
  );
}
