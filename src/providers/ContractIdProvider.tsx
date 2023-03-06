import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from "react";

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
  const [selectedContactId, setSelectedContactId] = useState<
    string | number | undefined
  >();

  const [selectedContact, setSelectedContact] = useState<
    SelectedContact | undefined
  >();

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
