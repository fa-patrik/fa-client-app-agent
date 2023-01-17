
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import { useGetContactInfo } from "api/initial/useGetContactInfo";
import { initials } from "utils/initials";
import { useKeycloak } from "./KeycloakProvider";

export type SelectedContact = {
  id: string | number;
  contactId: string | number;
  userName: string;
  initials: string;
}

type ContextProps = {
  selectedContactId: string | number;
  selectedContact: SelectedContact;
  setSelectedContactId: Dispatch<SetStateAction<string | number>>;
  setSelectedContact: Dispatch<SetStateAction<SelectedContact>>;
};

const ContractIdContext = createContext<ContextProps | undefined>(undefined);

export const DetailProvider = ({ children }: { children: ReactNode }) => {
  const {data: contactData } = useGetContactInfo()
  const [selectedContactId, setSelectedContactId] = useState<string | number>("");
  const [selectedContact, setSelectedContact] = useState<SelectedContact>({} as SelectedContact);
  const { linkedContact, userProfile } = useKeycloak();

useEffect(() => {
  //set initial selected contact upon load or refresh
  linkedContact && setSelectedContactId(linkedContact);
  linkedContact && userProfile && setSelectedContact({ 
    id: linkedContact, 
    contactId: contactData?._contactId ?? "",
    userName: contactData?.name ?? "", 
    initials: initials(contactData?.name)
  });
}, [linkedContact, userProfile, contactData?._contactId, contactData?.name]);

  return (
    <ContractIdContext.Provider
      value={{
        selectedContactId,
        selectedContact,
        setSelectedContactId,
        setSelectedContact,
      }}
    >
      {children}
    </ContractIdContext.Provider>
  );
};

export const useGetContractIdData = () => {
  const state = useContext(ContractIdContext);
  if (!state) throw new Error("detail data not found");

  return state;
};
