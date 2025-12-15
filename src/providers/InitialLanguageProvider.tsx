import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { LoadingIndicator } from "components";
import { initI18n, fallbackLanguage } from "../i18n";

interface DetectedLanguageProviderProps {
  children: ReactNode;
}

// used when we can't get language from API, then we use fallback language
export const InitialLanguageProvider = ({
  children,
}: DetectedLanguageProviderProps) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // we can't get language from API, so we use fallback language
    initI18n(fallbackLanguage, () => {
      setIsReady(true);
    });
  }, []);

  if (!isReady) {
    return (
      <div className="h-screen">
        <LoadingIndicator center />
      </div>
    );
  }

  return <>{children}</>;
};
