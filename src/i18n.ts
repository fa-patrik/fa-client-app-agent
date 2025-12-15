import i18n from "i18next";
import Backend from "i18next-http-backend";
import { initReactI18next } from "react-i18next";

export const fallbackLanguage = "en-US";

export const initI18n = async (language: string, callback: () => void) => {
  await i18n
    .use(Backend)
    .use(initReactI18next)
    .init({
      lng: language,
      fallbackLng: fallbackLanguage,
      interpolation: {
        escapeValue: false,
      },
      load: "currentOnly",
      defaultNS: "translation",
      backend: {
        loadPath: `${import.meta.env.BASE_URL}locales/{{lng}}/{{ns}}.json`,
      },
    });
  callback();
};
