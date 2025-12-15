import { type ReactNode, useEffect } from "react";
import { useGetContactInfo } from "api/common/useGetContactInfo";
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
 * Handles contact selection and impersonation logic.
 * @param children children elements to render.
 * @returns children
 */
export const ContactGuard = ({ children }: ContactGuardProps) => {
  const params = useParams();
  const impersonateId = params?.impersonateId;
  const { linkedContact, access } = useKeycloak();
  const { setSelectedContact, selectedContact } = useGetContractIdData();
  //this data is expected to be null if the
  //user does not have access rights to the contactId
  const {
    data: contactInfoData,
    error,
    loading,
  } = useGetContactInfo(
    false,
    access?.impersonate ? impersonateId : linkedContact
  );

  //set the user to the app
  useEffect(() => {
    // check if the user has access to the contact data
    if (contactInfoData?.contactId) {
      // override user's linked contact with the route param if impersonating
      if (
        access?.impersonate &&
        impersonateId &&
        impersonateId !== linkedContact
      ) {
        keycloakService.setLinkedContact(impersonateId);
      }

      if (contactInfoData?.contactId !== selectedContact?.contactId) {
        setSelectedContact({
          id: contactInfoData?.contactId,
          contactId: contactInfoData?._contactId,
          userName: contactInfoData?.name,
        });
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    access?.impersonate,
    impersonateId,
    linkedContact,
    contactInfoData?.contactId,
  ]);

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
