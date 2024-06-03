import { useEffect, useMemo, useState } from "react";
import { TradableSecurity } from "api/trading/useGetTradebleSecurities";
import { Button, Card, LabeledDiv } from "components";
import { ConfirmDialog } from "components/Dialog/ConfirmDialog";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { useWizard } from "providers/WizardProvider";
import { round } from "utils/number";
import { distributeAmount } from "utils/trading";
import { MonthlyInvestmentsWizardState } from "../types";
import DistributeInfo from "./components/DistributeInfo";
import SecurityDistributionList from "./components/SecurityDistributionList";

const getSum = (
  distribution: Record<string, string> | undefined,
  selectedSecurityIds: Set<string> | undefined
) => {
  return distribution !== undefined
    ? Object.entries(distribution)?.reduce((prev: number, [key, curr]) => {
        if (curr && !isNaN(Number(curr)) && selectedSecurityIds?.has(key))
          prev += Number(curr);
        return prev;
      }, 0)
    : 0;
};

/**
 * Step three of the monthly investments process.
 * The user allocates money to each selected security.
 */
const StepThree = () => {
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const { t } = useModifiedTranslation();
  const { wizardData, setWizardData } =
    useWizard<MonthlyInvestmentsWizardState>();
  const monthlyInvestmentsWizardState = wizardData.data;
  const amountDistribution = monthlyInvestmentsWizardState.amountDistribution;
  const percentageDistribution =
    monthlyInvestmentsWizardState.percentageDistribution;
  const selectedSecurities = monthlyInvestmentsWizardState.selectedSecurities;
  const amountToInvest = monthlyInvestmentsWizardState.amountToInvest ?? 0;
  const portfolioCurrency =
    monthlyInvestmentsWizardState.selectedPortfolioOption?.details?.currency;
  const selectedSecurityIds = useMemo(() => {
    return new Set(selectedSecurities?.map((ss) => ss.id.toString()));
  }, [selectedSecurities]);

  const portfolioCurrencyCode = portfolioCurrency?.securityCode;
  const CURRENCY_BLOCK_SIZE =
    portfolioCurrency?.amountDecimalCount !== undefined
      ? portfolioCurrency?.amountDecimalCount
      : 2;
  const PERCENTAGE_BLOCK_SIZE = 2;

  const { i18n } = useModifiedTranslation();

  const [securityToRemove, setSecurityToRemove] = useState<
    TradableSecurity | undefined
  >(undefined);

  const sumOfAmounts = useMemo(() => {
    return getSum(amountDistribution, selectedSecurityIds);
  }, [amountDistribution, selectedSecurityIds]);

  const isAnySelectedSecurityUnderMinAmount = useMemo(() => {
    return monthlyInvestmentsWizardState.selectedSecurities?.some(
      (security: TradableSecurity) => {
        const amountInputOnSecurity =
          amountDistribution !== undefined
            ? amountDistribution[security.id]
            : 0;
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
  }, [amountDistribution, monthlyInvestmentsWizardState.selectedSecurities]);

  const isAnySecurityZero = useMemo(() => {
    return selectedSecurities?.some((security: TradableSecurity) => {
      const amountInputOnSecurity =
        amountDistribution !== undefined ? amountDistribution[security.id] : 0;
      const amountInputOnSecurityAsNr =
        amountInputOnSecurity !== undefined ? Number(amountInputOnSecurity) : 0;
      return amountInputOnSecurityAsNr === 0;
    });
  }, [amountDistribution, selectedSecurities]);

  const diffAmount = useMemo(() => {
    return round((amountToInvest ?? 0) - sumOfAmounts, CURRENCY_BLOCK_SIZE);
  }, [CURRENCY_BLOCK_SIZE, amountToInvest, sumOfAmounts]);

  const diffPercentage = useMemo(
    () => round((diffAmount / amountToInvest) * 100, PERCENTAGE_BLOCK_SIZE),
    [diffAmount, PERCENTAGE_BLOCK_SIZE, amountToInvest]
  );

  const handleRemove = (security: TradableSecurity) => {
    setSecurityToRemove(security);
    setConfirmDialogOpen(true);
  };

  const removeSecurity = () => {
    if (securityToRemove !== undefined) {
      //remove security from selectedSecurities in wizard state
      //and remove its distribution entries
      setWizardData((prevState) => {
        const selectedSecuritiesWithoutSecurityId =
          prevState.data.selectedSecurities?.filter(
            (security: TradableSecurity) => security.id !== securityToRemove?.id
          );
        const newAmountDistribution = { ...prevState.data.amountDistribution };
        const newPercentageDistribution = {
          ...prevState.data.percentageDistribution,
        };
        delete newAmountDistribution[securityToRemove?.id];
        delete newPercentageDistribution[securityToRemove?.id];
        return {
          ...prevState,
          data: {
            ...prevState.data,
            selectedSecurities: selectedSecuritiesWithoutSecurityId,
            amountDistribution: newAmountDistribution,
            percentageDistribution: newPercentageDistribution,
          },
        };
      });
      setSecurityToRemove(undefined);
    }
    setConfirmDialogOpen(false);
  };

  const distributePercentageEvenly = () => {
    console.debug(
      "Distributing percentage evenly first, then amounts based on those"
    );
    const newAmountDistributions = { ...amountDistribution };
    const newPercentageDistributions = { ...percentageDistribution };
    const evenPercentageDistribution = distributeAmount(
      100,
      selectedSecurities?.length ?? 0,
      PERCENTAGE_BLOCK_SIZE
    );
    //update percentages and amounts
    selectedSecurities?.forEach((security, index) => {
      const newPercentage = evenPercentageDistribution[index];
      newPercentageDistributions[security.id] = newPercentage.toString();
      const percentage = parseFloat(newPercentageDistributions[security.id]);
      const newAmount = round(
        amountToInvest * (percentage / 100),
        CURRENCY_BLOCK_SIZE
      );
      newAmountDistributions[security.id] = newAmount.toString();
    });

    // Calculate the difference and distribute it
    const {
      amountDistribution: newAmountDistributionsAfterDiff,
      percentageDistribution: newPercentageDistributionsAfterDiff,
    } = distributeDifference(
      amountToInvest,
      newAmountDistributions,
      newPercentageDistributions,
      selectedSecurities,
      CURRENCY_BLOCK_SIZE,
      PERCENTAGE_BLOCK_SIZE
    );

    setWizardData((prevState) => ({
      ...prevState,
      data: {
        ...prevState.data,
        amountDistribution: newAmountDistributionsAfterDiff,
        percentageDistribution: newPercentageDistributionsAfterDiff,
      },
    }));
  };

  const distributeDifference = (
    amountToInvest: number,
    amountDistribution: Record<string, string>,
    percentageDistribution: Record<string, string>,
    selectedSecurities: TradableSecurity[] | undefined,
    CURRENCY_BLOCK_SIZE: number,
    PERCENTAGE_BLOCK_SIZE: number
  ) => {
    const selectedSecurityIds = new Set(
      selectedSecurities?.map((s) => s.id.toString())
    );
    const sum = getSum(amountDistribution, selectedSecurityIds);
    const diff = amountToInvest - sum;

    if (diff !== 0) {
      console.debug(`Distributing diff of ${diff} evenly`);
      const diffPerSecurity = distributeAmount(
        diff,
        selectedSecurities?.length ?? 0,
        CURRENCY_BLOCK_SIZE
      );

      selectedSecurities?.forEach((security, index) => {
        const amount = parseFloat(amountDistribution[security.id]);
        const newAmount = round(
          amount + diffPerSecurity[index],
          CURRENCY_BLOCK_SIZE
        );
        amountDistribution[security.id] = newAmount.toString();
        const newPercentage = round(
          (newAmount / (amountToInvest === 0 ? 1 : amountToInvest)) * 100,
          PERCENTAGE_BLOCK_SIZE
        );
        percentageDistribution[security.id] = newPercentage.toString();
      });
    }

    return { amountDistribution, percentageDistribution };
  };

  const distributeAmountBasedOnPercentage = () => {
    console.debug("Updating amounts based on existing percentages");
    const newAmountDistributions = { ...amountDistribution };
    const newPercentageDistributions = { ...percentageDistribution };
    selectedSecurities?.forEach((security) => {
      const percentage =
        newPercentageDistributions !== undefined
          ? parseFloat(newPercentageDistributions?.[security.id])
          : 0;
      const newAmount = round(
        amountToInvest * (percentage / 100),
        CURRENCY_BLOCK_SIZE
      );
      newAmountDistributions[security.id] = newAmount.toString();
    });

    console.debug(
      "newAmountDistributions before diff distribution",
      newAmountDistributions
    );
    console.debug(
      "newPercentageDistributions before diff distribution",
      newPercentageDistributions
    );

    // Calculate the difference and distribute it
    const {
      amountDistribution: newAmountDistributionsAfterDiff,
      percentageDistribution: newPercentageDistributionsAfterDiff,
    } = distributeDifference(
      amountToInvest,
      newAmountDistributions,
      newPercentageDistributions,
      selectedSecurities,
      CURRENCY_BLOCK_SIZE,
      PERCENTAGE_BLOCK_SIZE
    );
    console.debug("newAmountDistributions after diff", newAmountDistributions);
    console.debug(
      "newPercentageDistributions after diff",
      newPercentageDistributions
    );
    setWizardData((prevState) => ({
      ...prevState,
      data: {
        ...prevState.data,
        amountDistribution: newAmountDistributionsAfterDiff,
        percentageDistribution: newPercentageDistributionsAfterDiff,
      },
    }));
  };

  const setInput = (input: string, securityId: number, mode: string) => {
    const inputAsNumber = parseFloat(input);
    if (!isNaN(inputAsNumber)) {
      if (mode === "absolute") {
        const newPercentage =
          (inputAsNumber /
            (monthlyInvestmentsWizardState.amountToInvest ?? 1)) *
          100;
        setWizardData((prevState) => ({
          ...prevState,
          data: {
            ...prevState.data,
            amountDistribution: {
              ...prevState.data.amountDistribution,
              [securityId]: input,
            },
            percentageDistribution: {
              ...prevState.data.percentageDistribution,
              [securityId]: round(
                newPercentage,
                PERCENTAGE_BLOCK_SIZE
              ).toString(),
            },
          },
        }));
      } else {
        const newAbsolute =
          (inputAsNumber / 100) *
          (monthlyInvestmentsWizardState.amountToInvest ?? 0);
        setWizardData((prevState) => ({
          ...prevState,
          data: {
            ...prevState.data,
            percentageDistribution: {
              ...prevState.data.percentageDistribution,
              [securityId]: input,
            },
            amountDistribution: {
              ...prevState.data.amountDistribution,
              [securityId]: round(newAbsolute, CURRENCY_BLOCK_SIZE).toString(),
            },
          },
        }));
      }
    } else {
      setWizardData((prevState) => ({
        ...prevState,
        data: {
          ...prevState.data,
          amountDistribution: {
            ...prevState.data.amountDistribution,
            [securityId]: "",
          },
          percentageDistribution: {
            ...prevState.data.percentageDistribution,
            [securityId]: "",
          },
        },
      }));
    }
  };

  const areAllSecuritiesDistributedZero = () => {
    const distributed = selectedSecurities?.every(
      (s) =>
        s.id.toString() in (amountDistribution ?? {}) &&
        s.id.toString() in (percentageDistribution ?? {}) &&
        amountDistribution?.[s.id] === "0" &&
        percentageDistribution?.[s.id] === "0"
    );
    if (distributed) console.debug("All securities are distributed zero");
    return distributed;
  };

  useEffect(() => {
    const disableNext =
      diffAmount !== 0 ||
      isAnySelectedSecurityUnderMinAmount ||
      isAnySecurityZero;
    const disableBack = false;
    setWizardData((prevState) => ({
      ...prevState,
      nextDisabled: !!disableNext,
      backDisabled: disableBack,
    }));
  }, [
    setWizardData,
    isAnySelectedSecurityUnderMinAmount,
    isAnySecurityZero,
    diffAmount,
  ]);

  //distribute, if needed, on mount
  useEffect(() => {
    if (areAllSecuritiesDistributedZero()) {
      distributePercentageEvenly();
    } else if (
      monthlyInvestmentsWizardState.amountToInvestPrev !== undefined &&
      amountToInvest !== monthlyInvestmentsWizardState.amountToInvestPrev
    ) {
      distributeAmountBasedOnPercentage();
    }
    setWizardData((prevState) => ({
      ...prevState,
      data: {
        ...prevState.data,
        amountToInvestPrev: amountToInvest,
      },
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
                onClick={distributePercentageEvenly}
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
                diffAmount={diffAmount}
                diffPercentage={diffPercentage}
                overrideError={
                  isAnySecurityZero
                    ? t(
                        "wizards.monthlyInvestments.stepThree.securityAllocatedZeroError"
                      )
                    : undefined
                }
                currencyDecimalCount={CURRENCY_BLOCK_SIZE}
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
            percentageInputs={percentageDistribution ?? {}}
            amountInputs={amountDistribution ?? {}}
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
