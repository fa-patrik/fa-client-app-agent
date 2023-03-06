import { Suspense, useEffect } from "react";
import { useGetContactInfo } from "api/initial/useGetContactInfo";
import { LoadingIndicator } from "components";
import { ErrorBoundary } from "components/ErrorBoundary/ErrorBoundary";

import { useGetContractIdData } from "providers/ContractIdProvider";
import { useKeycloak } from "providers/KeycloakProvider";
import { Outlet, useParams } from "react-router-dom";
import { keycloakService } from "services/keycloakService";
import { initials } from "utils/initials";
import { ErrorView } from "views/errorView/errorView";

export const MainLayout = () => {
  const params = useParams();
  const contactId = params?.contactDbId;
  const { linkedContact } = useKeycloak();
  const { setSelectedContact, setSelectedContactId } = useGetContractIdData();
  //this data is expected to be null if the
  //user does not have access rights to the contactId
  const { data: initialSelectedContact, error } = useGetContactInfo(
    false,
    contactId || linkedContact
  );

  useEffect(() => {
    if (initialSelectedContact?.contactId) {
      //override user's linked contact with viewAsContact
      if (contactId && contactId !== linkedContact) {
        keycloakService.setLinkedContact(contactId);
      }
      setSelectedContactId(contactId || linkedContact);
      //set the selected contact
      setSelectedContact({
        id: initialSelectedContact?.contactId,
        contactId: initialSelectedContact?._contactId,
        userName: initialSelectedContact?.name,
        initials: initials(initialSelectedContact?.name),
      });
    }
  }, [
    contactId,
    linkedContact,
    initialSelectedContact?.contactId,
    initialSelectedContact?._contactId,
    initialSelectedContact?.name,
    setSelectedContactId,
    setSelectedContact,
  ]);

  if (error)
    return (
      <ErrorView
        title="notAllowedPage.title"
        info="notAllowedPage.info"
        navigateText="notAllowedPage.navigateText"
        navigateTo="/overview"
      />
    );

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
