import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { ReactComponent as RefreshIcon } from "assets/refresh.svg";
import { Button, Center } from "components";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { toast } from "react-toastify";
import { persistor } from "services/apolloClient";
import { useRegisterSW } from "virtual:pwa-register/react";

interface ServiceWorkerRegistrationProviderProps {
  children: ReactNode;
}

interface UpdateAppToastProps {
  updateServiceWorker: (reloadPage?: boolean) => Promise<void>;
}

const cachesToClearOnUpdate = [
  "keycloak",
  "images",
  "translations",
  "custom-html",
];

const UpdateAppToast = ({ updateServiceWorker }: UpdateAppToastProps) => {
  const { t } = useModifiedTranslation();
  const [loading, setLoading] = useState<boolean>(false);

  const refreshPage = async () => {
    setLoading(true);
    // clear caches
    (await caches.keys()).forEach((cacheName) => {
      if (cachesToClearOnUpdate.includes(cacheName)) caches.delete(cacheName);
    });
    // clear apollo's local storage cache
    await persistor.purge();
    // Update service worker and reload
    await updateServiceWorker(true);
    setLoading(false);
  };

  return (
    <Center>
      <div className="flex flex-col gap-2 items-center text-center whitespace-pre-line">
        <p>{String(t("messages.newVersion"))}</p>
        <Button
          onClick={refreshPage}
          LeftIcon={RefreshIcon}
          isLoading={loading}
        />
      </div>
    </Center>
  );
};

export const ServiceWorkerRegistrationProvider = ({
  children,
}: ServiceWorkerRegistrationProviderProps) => {
  const updateIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, registration) {
      // Service worker registered successfully
      if (registration) {
        // Clear any existing interval to prevent duplicates
        if (updateIntervalRef.current) {
          clearInterval(updateIntervalRef.current);
        }

        // Check for updates periodically
        updateIntervalRef.current = setInterval(
          () => {
            registration.update();
          },
          60 * 60 * 1000
        ); // Check every hour
      }
    },
  });

  useEffect(() => {
    if (needRefresh) {
      toast.info(<UpdateAppToast updateServiceWorker={updateServiceWorker} />, {
        toastId: "newVersionToast",
        theme: "light",
        icon: false,
      });
    }
  }, [needRefresh, updateServiceWorker]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, []);

  return <>{children}</>;
};
