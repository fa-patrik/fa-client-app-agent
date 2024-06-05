import { ErrorBoundary } from "components/ErrorBoundary/ErrorBoundary";
import { NavigationStack } from "components/NavigationStack/NavigationStack";
import { ConfigProvider } from "providers/ConfigProvider";
import { InitialLanguageProvider } from "providers/InitialLanguageProvider";
import { KeycloakProvider } from "providers/KeycloakProvider";
import { ServiceWorkerRegistrationProvider } from "providers/ServiceWorkerRegistrationProvider";
import { WizardProvider } from "providers/WizardProvider";
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
              <WizardProvider>
                <NavigationStack />
                <Toast />
              </WizardProvider>
            </KeycloakProvider>
          </ConfigProvider>
        </ErrorBoundary>
      </ServiceWorkerRegistrationProvider>
    </InitialLanguageProvider>
  );
}

export default App;
