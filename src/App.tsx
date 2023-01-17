import { ErrorBoundary } from "components/ErrorBoundary/ErrorBoundary";
import { APILanguageProvider } from "providers/APILanguageProvider/APILanguageProvider";
import { DetailProvider } from "providers/ContractIdProvider";
import { InitialLanguageProvider } from "providers/InitialLanguageProvider";
import { KeycloakProvider } from "providers/KeycloakProvider";
import { PersistedApolloProvider } from "providers/PersistedApolloProvider";
import { ServiceWorkerRegistrationProvider } from "providers/ServiceWorkerRegistrationProvider";
import { Toast } from "./components";
import { UserWithLinkedContactRoutes } from "./pages/userWithLinkedContact/routes";
import "react-toastify/dist/ReactToastify.css";
import "styles/fonts.css";

function App() {
  return (
    <InitialLanguageProvider>
      <ServiceWorkerRegistrationProvider>
        <ErrorBoundary>
          <KeycloakProvider>
            <PersistedApolloProvider>
              <DetailProvider>
                <APILanguageProvider>
                  <UserWithLinkedContactRoutes />
                </APILanguageProvider>
              </DetailProvider>
            </PersistedApolloProvider>
            <Toast />
          </KeycloakProvider>
        </ErrorBoundary>
      </ServiceWorkerRegistrationProvider>
    </InitialLanguageProvider>
  );
}

export default App;
