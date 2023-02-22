import { initReactI18next } from "react-i18next";
import i18n from "i18next";

const supportedLanguages = ["en-US"];

i18n.use(initReactI18next).init({
  lng: "en-US",
  fallbackLng: "en-US",
  interpolation: {
    escapeValue: false,
  },
  defaultNS: "translation",
  supportedLanguages,
  react: {
    useSuspense: false,
  },
});

supportedLanguages.forEach((lang) => {
  i18n.addResourceBundle(
    lang,
    "translation",
    require(`../public/locales/${lang}/translation.json`)
  );
});

export { i18n };
