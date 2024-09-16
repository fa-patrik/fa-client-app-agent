import { useGetContactInfo } from "api/common/useGetContactInfo";
import { useGetContractIdData } from "providers/ContractIdProvider";
import { useKeycloak } from "providers/KeycloakProvider";

export const useGetContactRepTagsAndLinkedContact = () => {
  const { linkedContact, trueLinkedContact, access } = useKeycloak();
  const { selectedContactId } = useGetContractIdData();
  const contactRepresentativeTags = useGetContactInfo(false, selectedContactId)
    ?.data?.representativeTags;

  const linkedC =
    access.impersonate && !access.advisor ? linkedContact : trueLinkedContact;

  return {
    contactRepresentativeTags,
    linkedContact: linkedC,
  };
};
