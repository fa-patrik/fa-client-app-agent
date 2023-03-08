import { useEffect, useState } from "react";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";

export const useFeedI18nextWithLocale = (locale: string | undefined) => {
  const [isReady, setIsReady] = useState(false);
  const { i18n } = useModifiedTranslation();

  useEffect(() => {
    if (locale) {
      i18n.changeLanguage(locale.replace("_", "-"), () => {
        setIsReady(true);
      });
    }

    return () => {
      // Cancel any pending state updates
      setIsReady(false);
    };
  }, [locale, i18n]);

  return { isReady };
};
