import type { Metadata } from "next";
import { AboutSection } from "@/components/organisms/AboutSection";
import { ComprehensiveServicesSection } from "@/components/organisms/ComprehensiveServicesSection";
import { ContactSection } from "@/components/organisms/ContactSection";
import { CoreServicesSection } from "@/components/organisms/CoreServicesSection";
import { ExecutivesLegalitySection } from "@/components/organisms/ExecutiveLegalittySection";
import { HeroSection } from "@/components/organisms/HeroSection";
import { VisionMissionSection } from "@/components/organisms/VisionMisionSection";
import { UpcomingTrainingsSection } from "@/components/organisms/UpcomingTrainingsSection";
import { DEFAULT_LOCALE, getDictionary, isLocale, languageAlternates, localizePath } from "@/lib/i18n";
import { getOpenTrainings } from "@/lib/registrations";

// The training schedule closes sign-ups by date; dashboard saves also
// revalidate right away
export const revalidate = 300;

const MAX_TRAININGS = 6;

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
  const trainings = await getOpenTrainings(MAX_TRAININGS + 1);

  return (
    <main className="min-h-screen">
      <HeroSection dict={dict.hero} />
      <AboutSection dict={dict.about} />
      <VisionMissionSection dict={dict.vision} />
      <CoreServicesSection dict={dict.coreServices} />
      <ComprehensiveServicesSection dict={dict.expertise} />
      <UpcomingTrainingsSection
        trainings={trainings.slice(0, MAX_TRAININGS)}
        hasMore={trainings.length > MAX_TRAININGS}
        lang={isLocale(lang) ? lang : DEFAULT_LOCALE}
        dict={dict.upcomingTrainings}
        dateLocale={dict.dateLocale}
      />
      <ExecutivesLegalitySection dict={dict.team} />
      <ContactSection dict={dict.contact} />
    </main>
  );
}
