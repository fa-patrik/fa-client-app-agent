import { useEffect } from "react";
import { useGetContactInfo } from "api/initial/useGetContactInfo";
import {
  SelectedContact,
  useGetContractIdData,
} from "providers/ContractIdProvider";
import { useNavigate, useParams } from "react-router-dom";
import { initials } from "utils/initials";
import { NotFoundView } from "views/notFoundView/notFoundView";

export const ViewAsPage = () => {
  const navigate = useNavigate();
  const { contactId } = useParams();
  const { data, loading } = useGetContactInfo(false, contactId);
  const { setSelectedContact, setSelectedContactId } = useGetContractIdData();

  //set the selected contact and navigate to Overview
  useEffect(() => {
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

  if (loading) return null;

  return <NotFoundView />;
};
