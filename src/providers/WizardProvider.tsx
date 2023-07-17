import React, { createContext, useState, useContext } from "react";

interface WizardData {
  step: number;
  /**
   * This could be any data relevant to the specific Wizard using the Context.
   * Initialized as an empty object. Remember to null check any content.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  /**
   * Whether to disable back button.
   */
  backDisabled: boolean;
  /**
   * Whether to disable next button.
   */
  nextDisabled: boolean;
  /**
   * Function to run when user completes the wizard.
   */
  onFinish?: () => void;

  /**
   * Initialized by the Wizard component.
   * Run to exit the wizard.
   */
  onExit?: () => void;

  /**
   * Initialized by the Wizard component.
   * Run to reset the wizard's state.
   */
  onReset?: () => void;
}

interface WizardContextProps {
  wizardData: WizardData;
  setWizardData: React.Dispatch<React.SetStateAction<WizardData>>;
}

const WizardContext = createContext<WizardContextProps | undefined>(undefined);

/**
 * Contains the active step + data of the currently running Wizard.
 */
export const WizardProvider: React.FC = ({ children }) => {
  const [wizardData, setWizardData] = useState<WizardData>({
    step: 0,
    data: {},
    backDisabled: true,
    nextDisabled: false,
    onFinish: undefined,
    onExit: undefined,
    onReset: undefined,
  });

  return (
    <WizardContext.Provider value={{ wizardData, setWizardData }}>
      {children}
    </WizardContext.Provider>
  );
};

export const useWizard = () => {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error("useWizard must be used within a WizardProvider");
  }
  return context;
};
