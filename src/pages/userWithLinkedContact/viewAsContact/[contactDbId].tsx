import { useEffect } from "react";
import { useGetContactInfo } from "api/initial/useGetContactInfo";
import { LoadingIndicator } from "components";
/*import {
  SelectedContact,
  useGetContractIdData,
} from "providers/ContractIdProvider";
*/
import { useNavigate, useParams } from "react-router-dom";
import { keycloakService } from "services/keycloakService";
//import { initials } from "utils/initials";
import { ErrorView } from "views/errorView/errorView";

/**
 * A page that overrides the keycloak linked contact to
 * its route param (contactDbId) and then navigates
 * the browser to Overview. Used to impersonate another
 * contact.
 */
export const ViewAsPage = () => {
  const navigate = useNavigate();
  //const { setSelectedContact, setSelectedContactId } = useGetContractIdData();
  const { contactDbId } = useParams();

  //this data is expected to be null if the
  //user does not have access rights to the contactDbId
  const { data: viewAsContactData, loading: loadingViewAsContactData } =
    useGetContactInfo(false, contactDbId);

  useEffect(() => {
    if (contactDbId && viewAsContactData) {
      /*
      const selectedContact = {
        id: viewAsContactData?.contactId,
        contactId: viewAsContactData?._contactId,
        userName: viewAsContactData?.name,
        initials: initials(viewAsContactData?.name),
      } as SelectedContact;
      setSelectedContact(selectedContact);
      setSelectedContactId(contactDbId);
      */
      keycloakService.setLinkedContact(contactDbId);
      navigate("/overview", { replace: true });
    }
  });

  if (loadingViewAsContactData) return <LoadingIndicator center />;

  return (
    <ErrorView
      title="notAllowedPage.title"
      info="notAllowedPage.info"
      navigateText="notAllowedPage.navigateText"
      navigateTo="/overview"
    />
  );
};
