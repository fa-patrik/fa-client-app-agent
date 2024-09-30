export const getBackendTranslation = (
  /**
   * Default translation
   */
  fallbackTranslation: string | undefined,
  /**
   * Translations from the backend in the form of a map
   * The key is the language code in the form of en_US
   */
  backendTranslationsMap: Record<string, string> = {},
  /**
   * The language the user wants
   */
  language: string,
  /**
   * The language the app found translations for (hopefully the same as the user wants)
   */
  resolvedLanguage: string
) => {
  if (!fallbackTranslation) return "";
  if (language !== resolvedLanguage) return fallbackTranslation;
  return (
    backendTranslationsMap[language.replace("-", "_")] || fallbackTranslation
  );
};
