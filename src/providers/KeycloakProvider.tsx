import { useContext } from "react";
import { createContext, ReactNode, useState, useEffect } from "react";
import { ErrorMessage, LoadingIndicator } from "components";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import {
  keycloakService,
  keycloakServiceInitialState,
  KeycloakServiceStateType,
} from "services/keycloakService";

const KeycloakContext = createContext<KeycloakServiceStateType>(
  keycloakServiceInitialState
);

type KeycloakProviderProps = {
  children: ReactNode;
};

export const KeycloakProvider = ({ children }: KeycloakProviderProps) => {
  const [keycloakState, setState] = useState<KeycloakServiceStateType>(
    keycloakServiceInitialState
  );

  const { error, initialized } = keycloakState;

  useEffect(() => {
    keycloakService.subscribe((newState) => {
      setState(newState);
    });
    return () => keycloakService.unsubscribe();
  }, []);

  if (error) {
    return <KeycloakError />;
  }

  if (!initialized) {
    return (
      <div className="h-screen">
        <LoadingIndicator center />
      </div>
    );
  }

  //initialized and no errors => render children safely
  return (
    <KeycloakContext.Provider value={keycloakState}>
      {children}
    </KeycloakContext.Provider>
  );
};

export const useKeycloak = () => {
  const context = useContext(KeycloakContext);
  if (context === undefined) {
    throw new Error("useKeycloak must be used within a KeycloakProvider");
  }
  return context;
};

const KeycloakError = () => {
  const { t } = useModifiedTranslation();

  return (
    <div className="h-screen">
      <ErrorMessage header={t("messages.authorisationError")}>
        <div className="mb-4">{t("messages.problemResolveInstructions")}</div>
        <div
          onClick={() => window.location.reload()}
          className="font-semibold text-primary-500 cursor-pointer"
        >
          {t("messages.refreshPage")}
        </div>
      </ErrorMessage>
    </div>
  );
};
