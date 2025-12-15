import i18n from "i18next";
import Backend from "i18next-http-backend";
import { initReactI18next } from "react-i18next";

export const fallbackLanguage = "en-US";
const supportedLanguages = ["en-US"];

// Storybook-specific i18n configuration using http-backend
i18n
  .use(Backend)
  .use(initReactI18next)
  .init({
    lng: "en-US",
    fallbackLng: fallbackLanguage,
    interpolation: {
      escapeValue: false,
    },
    load: "currentOnly",
    defaultNS: "translation",
    supportedLanguages,
    backend: {
      // Storybook serves static files from the public directory
      loadPath: "./locales/{{lng}}/{{ns}}.json",
      requestOptions: {
        cache: "default",
      },
    },
    react: {
      useSuspense: false,
    },
  });

export { i18n };
