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
// eslint-disable-next-line import/order
import { ConfigProvider } from "providers/ConfigProvider";

function App() {
  return (
    <InitialLanguageProvider>
      <ServiceWorkerRegistrationProvider>
        <ErrorBoundary>
          <ConfigProvider>
            <KeycloakProvider>
              <ConfigProvider>
                <WizardProvider>
                  <NavigationStack />
                  <Toast />
                </WizardProvider>
              </ConfigProvider>
            </KeycloakProvider>
          </ConfigProvider>
        </ErrorBoundary>
      </ServiceWorkerRegistrationProvider>
    </InitialLanguageProvider>
  );
}

export default App;
