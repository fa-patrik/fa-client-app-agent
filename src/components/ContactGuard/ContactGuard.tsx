import { ReactNode, useEffect } from "react";
import { useGetContactInfo } from "api/initial/useGetContactInfo";
import { LoadingIndicator } from "components";
import { useFeedI18nextWithLocale } from "hooks/useFeedI18nextWithLocale";
import { useGetContractIdData } from "providers/ContractIdProvider";
import { useKeycloak } from "providers/KeycloakProvider";
import { useParams } from "react-router-dom";
import { keycloakService } from "services/keycloakService";
import { NotFoundView } from "views/notFoundView/notFoundView";

interface ContactGuardProps {
  children: ReactNode;
  impersonate?: boolean;
}

/**
 * Before rendering its children, sets the selected contact
 * either based on the keycloak linked contact, or based on
 * a contactDbId route param. If using contactDbId
 * param, also updates linkedContact in keycloak state (impersonation mode).
 * @param children children elements to render.
 * @param impersonate set to true to use contactDbId, otherwise defaults to keycloak linked contact.
 * @returns children
 */
export const ContactGuard = ({ children, impersonate }: ContactGuardProps) => {
  const params = useParams();
  const contactId = params?.contactDbId;
  const { linkedContact } = useKeycloak();
  const { setSelectedContact, setSelectedContactId } = useGetContractIdData();
  //this data is expected to be null if the
  //user does not have access rights to the contactId
  const {
    data: initialSelectedContact,
    error,
    loading,
  } = useGetContactInfo(false, impersonate ? contactId : linkedContact);

  //set the user to the app
  useEffect(() => {
    if (initialSelectedContact?.contactId) {
      //override user's linked contact (impersonating)
      if (impersonate && contactId && contactId !== linkedContact) {
        keycloakService.setLinkedContact(contactId);
      }
      //set the selected contact
      setSelectedContactId(initialSelectedContact?.contactId);
      setSelectedContact({
        id: initialSelectedContact?.contactId,
        contactId: initialSelectedContact?._contactId,
        userName: initialSelectedContact?.name,
      });
    }
  }, [
    impersonate,
    contactId,
    linkedContact,
    initialSelectedContact?.contactId,
    initialSelectedContact?._contactId,
    initialSelectedContact?.name,
    setSelectedContactId,
    setSelectedContact,
  ]);

  const { isReady: isLanguageReady } = useFeedI18nextWithLocale(
    initialSelectedContact?.locale
  );

  if (error || (!loading && !initialSelectedContact?.contactId))
    return <NotFoundView />;

  if (loading || !isLanguageReady)
    return (
      <div className="flex justify-center items-center w-screen h-screen">
        <LoadingIndicator />
      </div>
    );

  return <>{children}</>;
};
