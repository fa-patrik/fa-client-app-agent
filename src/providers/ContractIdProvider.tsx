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
import { useParams } from "react-router-dom";
import { initials } from "utils/initials";
import { useKeycloak } from "./KeycloakProvider";

export type SelectedContact = {
  id: string | number | undefined;
  contactId: string | number | undefined;
  userName: string | undefined;
  initials: string | undefined;
};

type ContextProps = {
  selectedContactId: string | number | undefined;
  selectedContact: SelectedContact | undefined;
  setSelectedContactId: Dispatch<SetStateAction<string | number | undefined>>;
  setSelectedContact: Dispatch<SetStateAction<SelectedContact | undefined>>;
};

const ContractIdContext = createContext<ContextProps | undefined>(undefined);

export const DetailProvider = ({ children }: { children: ReactNode }) => {
  const { linkedContact } = useKeycloak();
  const { data: linkedContactData } = useGetContactInfo(false, linkedContact);
  const [selectedContactId, setSelectedContactId] = useState<
    string | number | undefined
  >();

  const [selectedContact, setSelectedContact] = useState<
    SelectedContact | undefined
  >();

  useEffect(() => {
    //set initial selected contact (& if linked contact changes)
    const newSelectedContact = {
      id: linkedContactData?.contactId,
      contactId: linkedContactData?._contactId,
      userName: linkedContactData?.name,
      initials: initials(linkedContactData?.name),
    };
    setSelectedContactId(linkedContactData?.contactId);
    setSelectedContact(newSelectedContact);
  }, [
    linkedContactData?._contactId,
    linkedContactData?.name,
    linkedContactData?.contactId,
  ]);

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
