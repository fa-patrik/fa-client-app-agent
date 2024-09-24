export const getBackendTranslation = (
  fallbackTranslation: string | undefined,
  backendTranslationsMap: Record<string, string> = {},
  locale: string
) => {
  if (!fallbackTranslation) return "";
  return (
    backendTranslationsMap[locale.replace("-", "_")] || fallbackTranslation
  );
};
