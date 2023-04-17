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
};

type ContextProps = {
  selectedContactId: string | number | undefined;
  selectedContact: SelectedContact | undefined;
  setSelectedContactId: Dispatch<SetStateAction<string | number | undefined>>;
  setSelectedContact: Dispatch<SetStateAction<SelectedContact | undefined>>;
};

const ContractIdContext = createContext<ContextProps | undefined>(undefined);

/**
 * Exposes the data of the currently selected contact
 * and allows its children to update it and subscribe
 * to changes. Selected contact is by default undefined
 * and is expected to be set by one of its children
 * (as is done by the ContactGuard component).
 */
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
  if (!state) throw new Error(" data not found");

  return state;
};
