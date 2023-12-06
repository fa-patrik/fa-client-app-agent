import { useEffect, useMemo, useState } from "react";
import { TradableSecurity } from "api/trading/useGetTradebleSecurities";
import { Button, Card, LabeledDiv } from "components";
import { ConfirmDialog } from "components/Dialog/ConfirmDialog";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { useWizard } from "providers/WizardProvider";
import { round } from "utils/number";
import { distributeTradeAmount } from "utils/trading";
import { MonthlyInvestmentsWizardState } from "../types";
import DistributeInfo from "./components/DistributeInfo";
import SecurityDistributionList from "./components/SecurityDistributionList";

/**
 * Step three of the monthly investments process.
 * The user allocates money to each selected security.
 */
const StepThree = () => {
  const { t } = useModifiedTranslation();
  const { wizardData, setWizardData } =
    useWizard<MonthlyInvestmentsWizardState>();
  const monthlyInvestmentsWizardState = wizardData.data;
  const portfolioCurrencyCode =
    monthlyInvestmentsWizardState.selectedPortfolioOption?.details?.currency
      ?.securityCode;
  const CURRENCY_BLOCK_SIZE =
    monthlyInvestmentsWizardState.selectedPortfolioOption?.details?.currency
      ?.amountDecimalCount !== undefined
      ? monthlyInvestmentsWizardState.selectedPortfolioOption?.details?.currency
          ?.amountDecimalCount
      : 2;
  const PERCENTAGE_BLOCK_SIZE = 2;

  const { i18n } = useModifiedTranslation();
  const [percentageInputs, setPercentageInputs] = useState<
    Record<string, string>
  >(() => {
    return monthlyInvestmentsWizardState.percentageDistribution !== undefined
      ? Object.entries(
          monthlyInvestmentsWizardState.percentageDistribution
        ).reduce((prev, [key, value]) => {
          prev[key] = round(value, PERCENTAGE_BLOCK_SIZE).toString(); //percentage should always be in 2 decimals
          return prev;
        }, {} as Record<string, string>)
      : {};
  });
  const [amountInputs, setAmountInputs] = useState<Record<string, string>>(
    () => {
      return monthlyInvestmentsWizardState.amountDistribution !== undefined
        ? Object.entries(
            monthlyInvestmentsWizardState.amountDistribution
          ).reduce((prev, [key, value]) => {
            prev[key] = round(value, CURRENCY_BLOCK_SIZE).toString();
            return prev;
          }, {} as Record<string, string>)
        : {};
    }
  );
  const [securityToRemove, setSecurityToRemove] = useState<
    TradableSecurity | undefined
  >(undefined);

  const [sumOfAmountInputs, setSumOfAmountInputs] = useState<number>(() => {
    const amountDistribution = monthlyInvestmentsWizardState.amountDistribution;
    if (amountDistribution) {
      return Object.values(amountDistribution)?.reduce((prev: number, curr) => {
        if (curr && !isNaN(curr)) prev += curr;
        return prev;
      }, 0);
    }
    return 0;
  });

  const [sumOfPercentageInputs, setSumOfPercentageInputs] = useState<number>(0);

  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const handleRemove = (security: TradableSecurity) => {
    setSecurityToRemove(security);
    setConfirmDialogOpen(true);
  };

  const removeSecurity = () => {
    //remove security from selectedSecurities in wizard state
    setWizardData((prevState) => {
      const selectedSecuritiesWithoutSecurityId =
        prevState.data.selectedSecurities?.filter(
          (security: TradableSecurity) => security.id !== securityToRemove?.id
        );
      return {
        ...prevState,
        data: {
          ...prevState.data,
          selectedSecurities: selectedSecuritiesWithoutSecurityId,
        },
      };
    });
    //remove input state of the security
    setAmountInputs((prevState) => {
      if (securityToRemove?.id) delete prevState[securityToRemove?.id];
      return { ...prevState };
    });
    setPercentageInputs((prevState) => {
      if (securityToRemove?.id) delete prevState[securityToRemove?.id];
      return { ...prevState };
    });
    setConfirmDialogOpen(false);
  };

  const distributeEvenly = () => {
    const selectedSecurities = monthlyInvestmentsWizardState.selectedSecurities;

    const amountToInvest = monthlyInvestmentsWizardState.amountToInvest;
    const nrOfSelectedSecurities = selectedSecurities?.length;
    if (
      nrOfSelectedSecurities &&
      nrOfSelectedSecurities > 0 &&
      amountToInvest
    ) {
      const distribution = distributeTradeAmount(
        amountToInvest,
        nrOfSelectedSecurities,
        CURRENCY_BLOCK_SIZE
      );
      const newInputsStates = selectedSecurities.reduce(
        (prev, curr, index) => {
          const amountPerSecurity = distribution[index] || 0;
          const percentagePerSecurity =
            (amountPerSecurity / amountToInvest || 1) * 100;

          prev.amountInputs[curr.id] = round(
            amountPerSecurity,
            CURRENCY_BLOCK_SIZE
          ).toString();
          prev.percentageInputs[curr.id] = round(
            percentagePerSecurity,
            PERCENTAGE_BLOCK_SIZE
          ).toString();
          return prev;
        },
        { amountInputs: {}, percentageInputs: {} } as Record<
          string,
          Record<string, string>
        >
      );
      setAmountInputs(() => ({ ...newInputsStates.amountInputs }));
      setPercentageInputs(() => ({ ...newInputsStates.percentageInputs }));
      return () => distributeEvenly();
    }
  };

  const setInput = (input: string, securityId: number, mode: string) => {
    const inputAsNumber = parseFloat(input);
    if (!isNaN(inputAsNumber)) {
      if (mode === "absolute") {
        setAmountInputs((prevState) => ({
          ...prevState,
          [securityId]: input,
        }));
        const newPercentage =
          (inputAsNumber /
            (monthlyInvestmentsWizardState.amountToInvest || 1)) *
          100;
        setPercentageInputs((prevState) => ({
          ...prevState,
          [securityId]: round(newPercentage, PERCENTAGE_BLOCK_SIZE).toString(),
        }));
      } else {
        setPercentageInputs((prevState) => ({
          ...prevState,
          [securityId]: input,
        }));
        const newAbsolute =
          (inputAsNumber / 100) *
          (monthlyInvestmentsWizardState.amountToInvest || 0);

        setAmountInputs((prevState) => ({
          ...prevState,
          [securityId]: round(newAbsolute, CURRENCY_BLOCK_SIZE).toString(),
        }));
      }
    } else {
      setPercentageInputs((prevState) => ({
        ...prevState,
        [securityId]: "",
      }));
      setAmountInputs((prevState) => ({
        ...prevState,
        [securityId]: "",
      }));
    }
  };

  //calculate sum of inputs by user
  useEffect(() => {
    setSumOfPercentageInputs(
      Object.values(percentageInputs)?.reduce((prev: number, curr) => {
        if (curr && !isNaN(Number(curr))) prev += Number(curr);
        return prev;
      }, 0) || 0
    );

    setSumOfAmountInputs(
      Object.values(amountInputs)?.reduce((prev: number, curr) => {
        if (curr && !isNaN(Number(curr))) prev += Number(curr);
        return prev;
      }, 0) || 0
    );

    const amountDistribution = Object.entries(amountInputs).reduce(
      (prev, [key, value]) => {
        prev[key] = Number(value);
        return prev;
      },
      {} as Record<string, number>
    );

    const percentageDistribution = Object.entries(percentageInputs).reduce(
      (prev, [key, value]) => {
        prev[key] = Number(value);
        return prev;
      },
      {} as Record<string, number>
    );

    setWizardData((prevState) => ({
      ...prevState,
      data: {
        ...prevState.data,
        amountDistribution,
        percentageDistribution,
      },
    }));
  }, [amountInputs, percentageInputs, setWizardData]);

  /**
   * Checks whether a re-distribution needs to occur based on
   * the presence and correctness of amount and percentage distributions.
   * Re-distribution is required if either distribution is missing, if the
   * total distributed amount doesn't match the amount to invest, or if
   * there's a discrepancy in the selected securities.
   * @returns true if need to evenly distribute.
   */
  const needToDistribute = () => {
    const state = monthlyInvestmentsWizardState;
    const {
      amountDistribution,
      percentageDistribution,
      amountToInvest,
      selectedSecurities,
    } = state;

    // Helper function to calculate the total distributed amount
    const calculateTotalAmountDistributed = () =>
      round(
        Object.values(amountDistribution || {}).reduce(
          (total, value) => total + value,
          0
        ),
        CURRENCY_BLOCK_SIZE
      );

    // Helper function to check whether distributions are present in state
    const areDistributionsPresent = () =>
      amountDistribution && percentageDistribution;

    // Helper function to check whether the count of selected securities matches distribution entries
    const isSecuritiesCountMatching = () => {
      const secIdsSelected =
        selectedSecurities?.map((s) => s.id.toString()) || [];
      return (
        Object.keys(amountDistribution || {}).length ===
          secIdsSelected.length &&
        Object.keys(percentageDistribution || {}).length ===
          secIdsSelected.length
      );
    };

    // Helper function to check whether all selected securities are present in both distributions
    const areAllSecuritiesDistributed = () => {
      const secIdsSelected =
        selectedSecurities?.map((s) => s.id.toString()) || [];
      return secIdsSelected.every(
        (id) =>
          id in (amountDistribution || {}) &&
          id in (percentageDistribution || {})
      );
    };

    // Main checks triggering re-distribution
    return (
      !areDistributionsPresent() ||
      calculateTotalAmountDistributed() !== amountToInvest ||
      !isSecuritiesCountMatching() ||
      !areAllSecuritiesDistributed()
    );
  };

  //distribute evenly once on mount
  useEffect(() => {
    if (needToDistribute()) {
      distributeEvenly();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //enable/disable next if amount distributed
  //or any security is below its min trade amount

  const isAnySelectedSecurityUnderMinAmount = useMemo(() => {
    return monthlyInvestmentsWizardState.selectedSecurities?.some(
      (security: TradableSecurity) => {
        const amountInputOnSecurity = amountInputs[security.id];
        const amountInputOnSecurityAsNr =
          amountInputOnSecurity !== undefined
            ? Number(amountInputOnSecurity)
            : 0;
        return (
          !!amountInputOnSecurityAsNr &&
          amountInputOnSecurityAsNr < security.minTradeAmount * security.fxRate
        );
      }
    );
  }, [amountInputs, monthlyInvestmentsWizardState.selectedSecurities]);

  const isAnySecurityZero = useMemo(() => {
    return monthlyInvestmentsWizardState.selectedSecurities?.some(
      (security: TradableSecurity) => {
        const amountInputOnSecurity = amountInputs[security.id];
        const amountInputOnSecurityAsNr =
          amountInputOnSecurity !== undefined
            ? Number(amountInputOnSecurity)
            : 0;
        return amountInputOnSecurityAsNr === 0;
      }
    );
  }, [amountInputs, monthlyInvestmentsWizardState.selectedSecurities]);

  useEffect(() => {
    const disableNext =
      round(sumOfAmountInputs, CURRENCY_BLOCK_SIZE) !==
        monthlyInvestmentsWizardState.amountToInvest ||
      isAnySelectedSecurityUnderMinAmount ||
      isAnySecurityZero;

    const disableBack = false;
    setWizardData((prevState) => ({
      ...prevState,
      nextDisabled: !!disableNext,
      backDisabled: disableBack,
    }));
  }, [
    sumOfAmountInputs,
    setWizardData,
    monthlyInvestmentsWizardState.amountToInvest,
    monthlyInvestmentsWizardState.selectedSecurities,
    amountInputs,
    CURRENCY_BLOCK_SIZE,
    isAnySelectedSecurityUnderMinAmount,
    isAnySecurityZero,
  ]);

  return (
    <div className="flex overflow-y-auto flex-col gap-y-4 p-4 m-auto w-full max-w-xl h-full">
      <div>
        <Card>
          <div className="flex flex-col gap-y-3 p-6">
            <div className="flex gap-x-2 justify-between">
              <LabeledDiv
                id="monthlyInvestmentsWizard-investmentAmount"
                label="Investment amount"
              >
                {wizardData?.data?.amountToInvest?.toLocaleString(
                  i18n.language,
                  {
                    style: "currency",
                    currency: portfolioCurrencyCode,
                  }
                )}
              </LabeledDiv>
              <Button
                id="monthlyInvestmentsWizard-distributeEvenlyButton"
                onClick={distributeEvenly}
                variant="Secondary"
                size="xs"
              >
                {t(
                  "wizards.monthlyInvestments.stepThree.distributeButtonLabel"
                )}
              </Button>
            </div>
            {monthlyInvestmentsWizardState?.amountToInvest && (
              <DistributeInfo
                diffAmount={
                  monthlyInvestmentsWizardState?.amountToInvest -
                  round(sumOfAmountInputs, CURRENCY_BLOCK_SIZE)
                }
                diffPercentage={
                  100 - round(sumOfPercentageInputs, PERCENTAGE_BLOCK_SIZE)
                }
                overrideError={
                  isAnySecurityZero ? "A security has 0 amount" : undefined
                }
              />
            )}
          </div>
        </Card>
      </div>
      {monthlyInvestmentsWizardState.selectedSecurities && (
        <div className="h-full min-h-[300px]">
          <SecurityDistributionList
            id="monthlyInvestmentsWizard-securityDistributionList"
            selectedSecurities={
              monthlyInvestmentsWizardState.selectedSecurities
            }
            handleRemove={handleRemove}
            setInput={setInput}
            percentageInputs={percentageInputs}
            amountInputs={amountInputs}
            currency={
              monthlyInvestmentsWizardState.selectedPortfolioOption?.details
                ?.currency
            }
          />
        </div>
      )}

      <ConfirmDialog
        id="monthlyInvestmentsWizard-removeSecurityDialog"
        title={t("wizards.monthlyInvestments.stepThree.removeDialogTitle")}
        description={t(
          "wizards.monthlyInvestments.stepThree.removeDialogDescription"
        )}
        confirmButtonText={t(
          "wizards.monthlyInvestments.stepThree.removeDialogConfirmButton"
        )}
        cancelButtonText={t(
          "wizards.monthlyInvestments.stepThree.removeDialogCancelButton"
        )}
        onConfirm={() => removeSecurity()}
        isOpen={confirmDialogOpen}
        setIsOpen={setConfirmDialogOpen}
      />
    </div>
  );
};

export default StepThree;
