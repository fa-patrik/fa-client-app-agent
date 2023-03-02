import { Suspense, useEffect } from "react";
import { useGetContactInfo } from "api/initial/useGetContactInfo";
import { LoadingIndicator } from "components";
import { ErrorBoundary } from "components/ErrorBoundary/ErrorBoundary";
import { useKeycloak } from "providers/KeycloakProvider";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import { keycloakService } from "services/keycloakService";

export const MainLayout = () => {
  const { linkedContact } = useKeycloak();
  const navigate = useNavigate();
  const { contactDbId } = useParams();

  //this data is expected to be null if the
  //user does not have access rights to the contactDbId
  const { data: impersonatedContactData, error: errorGettingImpersonateData } =
    useGetContactInfo(false, contactDbId);

  useEffect(() => {
    if (
      contactDbId &&
      !errorGettingImpersonateData &&
      impersonatedContactData
    ) {
      if (linkedContact !== contactDbId)
        keycloakService.setLinkedContact(contactDbId);
    }
  }, [
    contactDbId,
    impersonatedContactData,
    errorGettingImpersonateData,
    linkedContact,
  ]);

  return (
    <div className="box-border text-gray-900 bg-gray-50 h-[calc(100vh-0.5rem)]">
      <ErrorBoundary>
        <Suspense fallback={<LoadingIndicator center />}>
          <Outlet />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
};
