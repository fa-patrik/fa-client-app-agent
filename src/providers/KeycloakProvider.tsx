import { useContext } from "react";
import { createContext, ReactNode, useState, useEffect } from "react";
import { ErrorMessage, LoadingIndicator } from "components";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { AuthUserRoutes } from "pages/authUser/routes";
import {
  keycloakService,
  keycloakServiceInitialState,
  KeycloakServiceStateType,
} from "services/keycloakService";
import { PersistedApolloProvider } from "./PersistedApolloProvider";

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

  const { error, initialized, linkedContact } = keycloakState;

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

  //keycloak user has no linked Contact in FA
  if (!linkedContact) {
    return (
      <KeycloakContext.Provider value={keycloakState}>
        <PersistedApolloProvider>
          <AuthUserRoutes />
        </PersistedApolloProvider>
      </KeycloakContext.Provider>
    );
  }

  //keycloak user a linked Contact in FA
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
          className="font-semibold cursor-pointer text-primary-500"
        >
          {t("messages.refreshPage")}
        </div>
      </ErrorMessage>
    </div>
  );
};
