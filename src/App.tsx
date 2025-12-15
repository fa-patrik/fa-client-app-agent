import { ErrorBoundary } from "components/ErrorBoundary/ErrorBoundary";
import { Router } from "pages/routes";
import { ConfigProvider } from "providers/ConfigProvider";
import { InitialLanguageProvider } from "providers/InitialLanguageProvider";
import { KeycloakProvider } from "providers/KeycloakProvider";
import { PersistedApolloProvider } from "providers/PersistedApolloProvider";
import { ServiceWorkerRegistrationProvider } from "providers/ServiceWorkerRegistrationProvider";
import { Toast } from "./components";
import "react-toastify/dist/ReactToastify.css";
import "styles/fonts.css";

function App() {
  return (
    <InitialLanguageProvider>
      <ServiceWorkerRegistrationProvider>
        <ErrorBoundary>
          <ConfigProvider>
            <KeycloakProvider>
              <PersistedApolloProvider>
                <Router />
              </PersistedApolloProvider>
              <Toast />
            </KeycloakProvider>
          </ConfigProvider>
        </ErrorBoundary>
      </ServiceWorkerRegistrationProvider>
    </InitialLanguageProvider>
  );
}

export default App;
