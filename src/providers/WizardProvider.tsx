import React, {
  createContext,
  useState,
  useContext,
  type ReactNode,
} from "react";

interface WizardData<T = unknown> {
  step: number;
  data: T;
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

interface WizardContextProps<T = unknown> {
  wizardData: WizardData<T>;
  setWizardData: React.Dispatch<React.SetStateAction<WizardData<T>>>;
}

const WizardContext = createContext<WizardContextProps<unknown> | undefined>(
  undefined
);

export const WizardProvider = ({ children }: { children: ReactNode }) => {
  const [wizardData, setWizardData] = useState<WizardData<unknown>>({
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

export function useWizard<T = unknown>(): WizardContextProps<T> {
  const context = useContext(WizardContext) as WizardContextProps<T> | null;
  if (context === null) {
    throw new Error("useWizard must be used within a WizardProvider");
  }
  return context;
}
