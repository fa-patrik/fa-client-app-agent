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
  const routeContactId = params?.contactDbId;
  const { linkedContact } = useKeycloak();
  const { setSelectedContact, setSelectedContactId, selectedContact } =
    useGetContractIdData();
  //this data is expected to be null if the
  //user does not have access rights to the contactId
  const {
    data: contactInfoData,
    error,
    loading,
  } = useGetContactInfo(false, impersonate ? routeContactId : linkedContact);

  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  ) as URLSearchParams & { contactId: string | null };

  const queryParamContactId = searchParams.get("contactId");

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
    // check if the user has access to the contact data
    if (contactInfoData?.contactId) {
      // override user's linked contact with the route param if impersonating
      if (impersonate && routeContactId && routeContactId !== linkedContact) {
        keycloakService.setLinkedContact(routeContactId);
      }
      // if query param exists and is valid, use it to set the selected contact
      // otherwise set the selected contact based on the contactInfo query result data
      const queryParamBasedContact =
        queryParamContactId &&
        contactInfoData.representees?.find(
          (representee) => +representee.id === +queryParamContactId
        );

      // just making sure the contact data exists
      if (queryParamBasedContact && queryParamBasedContact.contactId) {
        setSelectedContactId(queryParamBasedContact.id);
        setSelectedContact({
          id: queryParamBasedContact.id,
          contactId: queryParamBasedContact.contactId,
          userName: queryParamBasedContact.name,
        });
      } else if (contactInfoData?.contactId !== selectedContact?.contactId) {
        setSelectedContactId(contactInfoData?.contactId);
        setSelectedContact({
          id: contactInfoData?.contactId,
          contactId: contactInfoData?._contactId,
          userName: contactInfoData?.name,
        });
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [impersonate, routeContactId, linkedContact, contactInfoData?.contactId]);

  const { isReady: isLanguageReady } = useFeedI18nextWithLocale(
    contactInfoData?.locale
  );

  if (error || (!loading && !contactInfoData?.contactId))
    return <NotFoundView />;

  if (loading || !isLanguageReady)
    return (
      <div className="flex justify-center items-center w-screen h-screen">
        <LoadingIndicator />
      </div>
    );

  return <>{children}</>;
};
