import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { StandardSolutionTaxWrapper } from "api/enums";
import { useGetAvailableTaxWrappers } from "api/taxes/useGetAvailableTaxWrappers";
import { shouldShowTaxBadge, dismissCurrentTaxMilestone } from "utils/taxYear";

interface TaxesNotificationContextType {
  isVisible: boolean;
  dismissAlert: () => void;
}

const TaxesNotificationContext = createContext<TaxesNotificationContextType | undefined>(undefined);

export const TaxesNotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: taxWrappersData } = useGetAvailableTaxWrappers();
  const [isVisible, setIsVisible] = useState(false);
  
  const taxYearStartDate = useMemo(() => {
    if (taxWrappersData) {
      const availableTaxWrappers = taxWrappersData.taxWrappers || [];
      const isaWrapper = availableTaxWrappers.find(wrapper => wrapper.code === StandardSolutionTaxWrapper.IndividualSavingsAccount);
      return isaWrapper?.taxYearStartDate;
    }
    return undefined;
  }, [taxWrappersData]);

  useEffect(() => {
    const checkVisibility = () => {
      const shouldShow = shouldShowTaxBadge(new Date(), localStorage, taxYearStartDate);
      setIsVisible(shouldShow);
    };

    checkVisibility();
  }, [taxYearStartDate]);

  const dismissAlert = () => {
    dismissCurrentTaxMilestone(new Date(), localStorage, taxYearStartDate);
    setIsVisible(false);
  };

  const value = { isVisible, dismissAlert };

  return (
    <TaxesNotificationContext.Provider value={value}>
      {children}
    </TaxesNotificationContext.Provider>
  );
};

export const useTaxesNotification = () => {
  const context = useContext(TaxesNotificationContext);
  if (context === undefined) {
    throw new Error('useTaxesNotification must be used within a TaxesNotificationProvider');
  }
  return context;
};
