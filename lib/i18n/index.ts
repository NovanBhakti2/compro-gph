import { en, type Dictionary } from "./dictionaries/en";
import { id } from "./dictionaries/id";
import { DEFAULT_LOCALE, isLocale, type Locale } from "./config";

export * from "./config";
export type { Dictionary };

const DICTIONARIES: Record<Locale, Dictionary> = { en, id };

export function getDictionary(locale: string): Dictionary {
  return DICTIONARIES[isLocale(locale) ? locale : DEFAULT_LOCALE];
}
