import { ReactNode, useEffect, useMemo } from "react";
import { useGetContactInfo } from "api/initial/useGetContactInfo";
import { LoadingIndicator } from "components";
import { useFeedI18nextWithLocale } from "hooks/useFeedI18nextWithLocale";
import { useGetContractIdData } from "providers/ContractIdProvider";
import { useKeycloak } from "providers/KeycloakProvider";
import { useLocation, useNavigate, useParams } from "react-router-dom";
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
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const contactId = params?.contactDbId;
  const { linkedContact } = useKeycloak();
  const { setSelectedContact, setSelectedContactId, selectedContact } =
    useGetContractIdData();
  //this data is expected to be null if the
  //user does not have access rights to the contactId
  const {
    data: initialSelectedContact,
    error,
    loading,
  } = useGetContactInfo(false, impersonate ? contactId : linkedContact);

  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  ) as URLSearchParams & { contactId: string | null };

  const contactIdFromURL = searchParams.get("contactId");

  useEffect(() => {
    if (!selectedContact?.id || !linkedContact) return;

    if (selectedContact?.id?.toString() !== linkedContact?.toString())
      searchParams.set("contactId", selectedContact?.id.toString());
    else searchParams.delete("contactId");

    navigate({ search: searchParams.toString() }, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedContact?.id, navigate]);

  //set the user to the app
  useEffect(() => {
    if (initialSelectedContact?.contactId) {
      //override user's linked contact (impersonating)
      if (impersonate && contactId && contactId !== linkedContact) {
        keycloakService.setLinkedContact(contactId);
      }

      //set the selected contact
      if (!contactIdFromURL) {
        setSelectedContactId(initialSelectedContact?.contactId);
        setSelectedContact({
          id: initialSelectedContact?.contactId,
          contactId: initialSelectedContact?._contactId,
          userName: initialSelectedContact?.name,
        });
      } else {
        const selectedContact = initialSelectedContact.representees?.find(
          (representee) => +representee.id === +contactIdFromURL
        );

        if (selectedContact) {
          setSelectedContactId(selectedContact.id);
          setSelectedContact({
            id: selectedContact.id,
            contactId: selectedContact.contactId,
            userName: selectedContact.name,
          });
        }
      }
    }
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    impersonate,
    contactId,
    linkedContact,
    initialSelectedContact?.contactId,
    initialSelectedContact?._contactId,
    initialSelectedContact?.representees,
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
