export const getBackendTranslation = (
    fallbackTranslation: string,
    backendTranslationsMap: Record<string, string> = {},
    locale: string
  ) => {
    return (
      backendTranslationsMap[locale.replace("-", "_")] || fallbackTranslation
    );
  };