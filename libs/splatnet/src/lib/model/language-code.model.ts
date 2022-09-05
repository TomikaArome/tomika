export type LanguageCode = 'en-US' | 'en-MX' | 'fr-CA' | 'ja-JP' | 'en-GB' | 'es-ES' | 'fr-FR' | 'de-DE' | 'it-IT' | 'nl-NL' | 'ru-RU';
export const isLanguageCode = (value) => ['en-US', 'en-MX', 'fr-CA', 'ja-JP', 'en-GB', 'es-ES', 'fr-FR', 'de-DE', 'it-IT', 'nl-NL', 'ru-RU'].includes(value);
