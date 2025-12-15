import { useState, useMemo, useEffect } from "react";
import { useGetContactInfo } from "api/common/useGetContactInfo";
import { StandardSolutionTaxWrapper } from "api/enums";
import { useGetAvailableTaxWrappers } from "api/taxes/useGetAvailableTaxWrappers";
import type { ClientTaxAllowancesResult } from "api/taxes/useGetClientTaxAllowances";
import { useGetClientTaxAllowancesWithWrappers } from "api/taxes/useGetClientTaxAllowancesWithWrappers";
import {
  QueryLoadingWrapper,
  LoadingIndicator,
  ErrorMessage,
} from "components";
import Alert, { Severity } from "components/Alert/Alert";
import { Card } from "components/Card/Card";
import { useModal } from "components/Modal/useModal";
import { DepositModalContent } from "components/MoneyModals/DepositModalContent/DepositModalContent";
import type { Option } from "components/Select/Select";
import { Select } from "components/Select/Select";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import type { MappedPortfolio } from "hooks/useTaxWrapperPortfolioMapping";
import { useTaxWrapperPortfolioMapping } from "hooks/useTaxWrapperPortfolioMapping";
import { useGetContractIdData } from "providers/ContractIdProvider";
import { useTaxesNotification } from "providers/TaxesNotificationProvider";
import {
  getCurrentTaxYear,
  getCurrentTaxYearEndDate,
  calculateDaysRemaining,
  generateTaxYearOptions,
  getCalcDateFromTaxYear,
} from "utils/taxYear";
import { TaxAllowancePieChart, ISATypeSection } from "./components";

// Main TaxesView Component
export const TaxesView = () => {
  const { selectedContactId } = useGetContractIdData();
  const { data: contactInfo } = useGetContactInfo(false, selectedContactId);

  // Get the contact code (string) instead of the numeric ID
  const contactCode = contactInfo?._contactId;

  // First, get the available tax wrappers to determine ISA tax year start date
  const { data: taxWrappersData, loading: taxWrappersLoading } =
    useGetAvailableTaxWrappers();
  const availableTaxWrappers = taxWrappersData?.taxWrappers || [];

  // Get ISA wrapper's tax year start date
  const isaWrapper = availableTaxWrappers.find(
    (wrapper) =>
      wrapper.code === StandardSolutionTaxWrapper.IndividualSavingsAccount
  );
  const taxYearStartDate = isaWrapper?.taxYearStartDate;

  // Generate tax year options dynamically based on ISA tax year start date
  const taxYearOptions: Option[] = useMemo(
    () => generateTaxYearOptions(taxYearStartDate),
    [taxYearStartDate]
  );

  const [selectedTaxYear, setSelectedTaxYear] = useState<Option>(
    () => taxYearOptions[0] || { id: "", label: "" }
  );

  // Update selected tax year when options become available
  useEffect(() => {
    if (
      taxYearOptions.length > 0 &&
      (!selectedTaxYear.id || selectedTaxYear.id === "")
    ) {
      setSelectedTaxYear(taxYearOptions[0]);
    }
  }, [taxYearOptions, selectedTaxYear.id]);

  const currentTaxYearLabel = useMemo(
    () => getCurrentTaxYear(new Date(), taxYearStartDate),
    [taxYearStartDate]
  );
  const isCurrentYear = selectedTaxYear.id === currentTaxYearLabel;

  // For the current tax year, use today's date for the API call to get the most up-to-date data.
  // For past tax years, use the end date of that tax year to get the final historical data.
  const calcDate = useMemo(() => {
    if (isCurrentYear) {
      return new Date().toISOString().split("T")[0]; // YYYY-MM-DD format
    }
    return getCalcDateFromTaxYear(
      selectedTaxYear.id?.toString() || "",
      taxYearStartDate
    );
  }, [selectedTaxYear.id, taxYearStartDate, isCurrentYear]);

  const {
    loading: allowancesLoading,
    error,
    data,
  } = useGetClientTaxAllowancesWithWrappers({
    contactId: contactCode || "",
    calcDate,
    skip: !contactCode,
  });

  const loading = taxWrappersLoading || allowancesLoading;

  return (
    <QueryLoadingWrapper
      loading={loading}
      error={error}
      data={data}
      SuccessComponent={(props) => (
        <TaxesContent
          {...props}
          selectedTaxYear={selectedTaxYear}
          onTaxYearChange={setSelectedTaxYear}
          loading={loading}
          availableTaxWrappers={availableTaxWrappers}
          taxYearStartDate={taxYearStartDate}
          taxYearOptions={taxYearOptions}
          isCurrentYear={isCurrentYear}
        />
      )}
    />
  );
};

interface TaxesContentProps {
  data: ClientTaxAllowancesResult;
  selectedTaxYear: Option;
  onTaxYearChange: (option: Option) => void;
  loading: boolean;
  availableTaxWrappers: Array<{
    id: string;
    code: string;
    name: string;
    taxYearStartDate: string;
  }>;
  taxYearStartDate?: string;
  taxYearOptions: Option[];
  isCurrentYear: boolean;
}

const TaxesContent = ({
  data,
  selectedTaxYear,
  onTaxYearChange,
  loading,
  taxYearStartDate,
  taxYearOptions,
  isCurrentYear,
}: TaxesContentProps) => {
  const { t } = useModifiedTranslation();
  const [selectedPortfolioForTopUp, setSelectedPortfolioForTopUp] =
    useState<MappedPortfolio | null>(null);

  const {
    Modal: DepositModal,
    onOpen: onDepositModalOpen,
    modalProps: depositModalProps,
    contentProps: depositModalContentProps,
  } = useModal();

  // Use tax year utility functions with dynamic tax year start date
  const now = new Date();

  const endDate = getCurrentTaxYearEndDate(now, taxYearStartDate);
  const daysRemaining = isCurrentYear
    ? calculateDaysRemaining(now, endDate)
    : 0;

  // Always call the hook at the top level, then apply conditions
  const { isVisible: shouldShowBadge, dismissAlert } = useTaxesNotification();
  const shouldShowNotification = isCurrentYear && shouldShowBadge;

  const handleTopUp = (portfolio: MappedPortfolio) => {
    setSelectedPortfolioForTopUp(portfolio);
    onDepositModalOpen();
  };

  const isaAllowanceTotals = data.summary;
  const childAllowances = data.childAllowances;

  // Check if we have tax data - this ensures isaAllowanceTotals is not null when hasData is true
  const hasData = data.isaAllowance && isaAllowanceTotals;

  // Apply parent ISA constraints to child allowances before mapping
  const constrainedChildAllowances = useMemo(() => {
    if (!hasData || !childAllowances || !data.isaAllowance) {
      return [];
    }

    const parentRemainingAmount = data.isaAllowance.remainingAllowance;

    return childAllowances.map((childAllowance) => {
      // If child remaining amount exceeds parent remaining amount, constrain it
      const constrainedRemainingAmount = Math.min(
        childAllowance.remainingAllowance,
        parentRemainingAmount
      );

      const isConstrained =
        childAllowance.remainingAllowance > parentRemainingAmount;

      return {
        ...childAllowance,
        remainingAllowance: constrainedRemainingAmount,
        // Add metadata to track if this child was constrained
        isConstrainedByParent: isConstrained,
        parentRemainingAmount: parentRemainingAmount,
      };
    });
  }, [hasData, childAllowances, data.isaAllowance]);

  const { mappedTaxAllowances } = useTaxWrapperPortfolioMapping(
    constrainedChildAllowances
  );

  return (
    <div className="space-y-6">
      {/* Notification Alert */}
      {shouldShowNotification && (
        <Alert
          id="taxes-allowance-reminder"
          severity={Severity.Info}
          title={t("taxesPage.taxYearDeadlineTitle")}
          content={t("taxesPage.taxYearDeadlineContent", {
            daysRemaining,
            taxYear: selectedTaxYear.label,
          })}
          dismissible={true}
          onDismiss={dismissAlert}
          fullWidth={true}
        />
      )}
      <Card>
        {/* Tax Year Selector - Always visible */}
        <div className="flex flex-row gap-4 items-end p-2">
          <div className="shrink-0 w-40 sm:w-64">
            <Select
              label={t("taxesPage.taxYearLabel")}
              value={selectedTaxYear}
              onChange={onTaxYearChange}
              options={taxYearOptions}
            />
          </div>
          {hasData && isCurrentYear && (
            <div className="flex flex-col shrink-0">
              <label className="mb-2 text-sm font-medium text-gray-700">
                {daysRemaining} {t("taxesPage.daysRemaining")}
              </label>
            </div>
          )}
        </div>
      </Card>

      {/* Content Area - Conditional */}
      {loading && !hasData ? (
        <Card>
          <div className="p-6">
            <LoadingIndicator center size="md" />
          </div>
        </Card>
      ) : !hasData ? (
        <ErrorMessage header={t("taxesPage.noTaxAllowanceData")}>
          {t("messages.problemResolveInstructions")}
        </ErrorMessage>
      ) : (
        <Card header={t("taxesPage.isaAllowanceHeader")}>
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Side - Pie Chart (shows child allowances breakdown) */}
              <div>
                <TaxAllowancePieChart
                  taxAllowances={childAllowances}
                  summary={isaAllowanceTotals}
                />
              </div>

              {/* Right Side - ISA Details*/}
              <div className="space-y-8">
                {/* Child ISA Sections (breakdown) */}
                {mappedTaxAllowances.map((allowance) => (
                  <ISATypeSection
                    key={allowance.taxWrapperId}
                    title={allowance.taxWrapperName}
                    totalAmount={allowance.totalAllowance}
                    usedAmount={allowance.usedAllowance}
                    remainingAmount={allowance.remainingAllowance}
                    currency={isaAllowanceTotals.currency}
                    mappedPortfolios={allowance.mappedPortfolios}
                    onTopUp={handleTopUp}
                    isConstrainedByParent={allowance.isConstrainedByParent}
                    parentRemainingAmount={allowance.parentRemainingAmount}
                  />
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Deposit Modal */}
      <DepositModal
        {...depositModalProps}
        header={t("moneyModal.depositModalHeader")}
      >
        <DepositModalContent
          {...depositModalContentProps}
          preselectedPortfolioId={selectedPortfolioForTopUp?.id}
        />
      </DepositModal>
    </div>
  );
};
