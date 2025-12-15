import type { Dispatch, ReactNode, SetStateAction } from "react";
import { createContext, useContext, useMemo, useState } from "react";

export type SelectedContact = {
  id: string | number | undefined;
  contactId: string | number | undefined;
  userName: string | undefined;
};

type ContextProps = {
  selectedContactId: string | number | undefined;
  selectedContact: SelectedContact | undefined;
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
  const [selectedContact, setSelectedContact] = useState<
    SelectedContact | undefined
  >();

  // Derive selectedContactId from selectedContact to avoid state sync issues
  const selectedContactId = useMemo(
    () => selectedContact?.id,
    [selectedContact?.id]
  );

  const contextValue = useMemo(
    () => ({
      selectedContactId,
      selectedContact,
      setSelectedContact,
    }),
    [selectedContactId, selectedContact]
  );

  return (
    <ContractIdContext.Provider value={contextValue}>
      {children}
    </ContractIdContext.Provider>
  );
};

export const useGetContractIdData = () => {
  const state = useContext(ContractIdContext);
  if (!state) throw new Error(" data not found");

  return state;
};
