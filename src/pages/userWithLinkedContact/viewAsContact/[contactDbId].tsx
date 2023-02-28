import { useEffect } from "react";
import { useGetContactInfo } from "api/initial/useGetContactInfo";
import { LoadingIndicator } from "components";
import {
  SelectedContact,
  useGetContractIdData,
} from "providers/ContractIdProvider";
import { useNavigate, useParams } from "react-router-dom";
import { initials } from "utils/initials";
import { NotFoundView } from "views/notFoundView/notFoundView";

/**
 * A page that sets the selected contact to
 * its route param (contactId) and then navigates
 * the user to Overview.
 */
export const ViewAsPage = () => {
  const navigate = useNavigate();
  const { contactDbId } = useParams();
  const { data, loading } = useGetContactInfo(false, contactDbId);
  const { setSelectedContact, setSelectedContactId } = useGetContractIdData();

  //set the selected contact and navigate to Overview
  useEffect(() => {
    //data can be null if the user does not have access to the
    //requested contact (limited visibility)
    if (data?.contactId) {
      const selectedContact = {
        id: data?.contactId,
        contactId: data?._contactId,
        userName: data?.name,
        initials: initials(data?.name),
      } as SelectedContact;

      setSelectedContact(selectedContact);
      setSelectedContactId(data?.contactId);
      navigate("/overview", { replace: true });
    }
  });

  if (loading) return <LoadingIndicator center />;

  return <NotFoundView />;
};
