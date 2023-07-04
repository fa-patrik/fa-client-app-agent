import { useEffect, useState } from "react";
import { TradableSecurity } from "api/trading/useGetTradebleSecurities";
import { Button, Card, LabeledDiv } from "components";
import { ConfirmDialog } from "components/Dialog/ConfirmDialog";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { useWizard } from "providers/WizardProvider";
import DistributeInfo from "./DistributeInfo";
import SecurityDistributionList from "./SecurityDistributionList";

/**
 * Rounds to 2 decimals.
 * @param number
 * @returns
 */
const round = (number: number | undefined) => {
  if (number) return Math.round(number * 100) / 100;
  return 0;
};

/**
 * Distributes a trade amount with 2 decimals precision.
 * @param total the trade amount to distribute.
 * @param numSecurities nr of securities to distribute trade amount to.
 * @returns A list of suggested trade amounts that should always summarize
 * to exactly the total.
 */
function distributeTradeAmount(total: number, numSecurities: number): number[] {
  if (total <= 0 || numSecurities <= 0) {
    return [];
  }

  const scaledTotal = Math.round(total * 100);
  const baseAmount = Math.floor(scaledTotal / numSecurities);
  const remaining = scaledTotal - baseAmount * numSecurities;

  const distribution = new Array(numSecurities).fill(baseAmount);

  for (let i = 0; i < remaining; i++) {
    distribution[i]++;
  }

  return distribution.map((amount) => amount / 100);
}

/**
 * Step three of the monthly investments process.
 * The user allocates money to each selected security.
 */
const StepThree = () => {
  const { wizardData, setWizardData } = useWizard();
  const portfolioCurrencyCode =
    wizardData.data.selectedPortfolio?.currency?.securityCode;
  const { i18n } = useModifiedTranslation();
  const [percentageInputs, setPercentageInputs] = useState<
    Record<string, number | undefined>
  >(wizardData.data.percentageDistribution || {});
  const [amountInputs, setAmountInputs] = useState<
    Record<string, number | undefined>
  >(wizardData.data.amountDistribution || {});
  const [securityToRemove, setSecurityToRemove] = useState<
    TradableSecurity | undefined
  >(undefined);

  const [sumOfAmountInputs, setSumOfAmountInputs] = useState<number>(() => {
    const amountDistribution: Record<string, number> =
      wizardData.data.amountDistribution;
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
        prevState.data.selectedSecurities.filter(
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
    const selectedSecurities: TradableSecurity[] =
      wizardData.data.selectedSecurities;

    const amountToInvest = wizardData.data.amountToInvest;
    const nrOfSelectedSecurities = selectedSecurities?.length;
    if (nrOfSelectedSecurities > 0) {
      const distribution = distributeTradeAmount(
        amountToInvest,
        nrOfSelectedSecurities
      );
      const newInputsStates = selectedSecurities.reduce(
        (prev, curr, index) => {
          const amountPerSecurity = distribution[index] || 0;
          const percentagePerSecurity =
            (amountPerSecurity / amountToInvest || 1) * 100;

          prev.amountInputs[curr.id] = amountPerSecurity;
          prev.percentageInputs[curr.id] = percentagePerSecurity;
          return prev;
        },
        { amountInputs: {}, percentageInputs: {} } as Record<
          string,
          Record<string, number>
        >
      );
      setAmountInputs(() => ({ ...newInputsStates.amountInputs }));
      setPercentageInputs(() => ({ ...newInputsStates.percentageInputs }));
      return () => distributeEvenly();
    }
  };

  const setInput = (input: string, securityId: number, mode: string) => {
    let newNumber = parseFloat(input);
    if (!isNaN(newNumber)) {
      newNumber = Math.round(newNumber * 100) / 100; // Round off to 2 decimal places
      if (mode === "absolute") {
        setAmountInputs((prevState) => ({
          ...prevState,
          [securityId]: newNumber,
        }));
        const newPercentage =
          (newNumber / wizardData.data.amountToInvest) * 100;
        setPercentageInputs((prevState) => ({
          ...prevState,
          [securityId]: newPercentage,
        }));
      } else {
        setPercentageInputs((prevState) => ({
          ...prevState,
          [securityId]: newNumber,
        }));
        const newAbsolute = (newNumber / 100) * wizardData.data.amountToInvest;
        setAmountInputs((prevState) => ({
          ...prevState,
          [securityId]: newAbsolute,
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
        if (curr && !isNaN(curr)) prev += curr;
        return prev;
      }, 0) || 0
    );

    setSumOfAmountInputs(
      Object.values(amountInputs)?.reduce((prev: number, curr) => {
        if (curr && !isNaN(curr)) prev += curr;
        return prev;
      }, 0) || 0
    );

    setWizardData((prevState) => ({
      ...prevState,
      data: {
        ...prevState.data,
        amountDistribution: amountInputs,
        percentageDistribution: percentageInputs,
      },
    }));
  }, [amountInputs, percentageInputs, setWizardData]);

  //distribute evenly once on mount
  useEffect(() => {
    distributeEvenly();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //enable/disable next if amount distributed
  //or any security is below its min trade amount
  useEffect(() => {
    const isAnySelectedSecurityUnderMinAmount =
      wizardData.data.selectedSecurities?.some((security: TradableSecurity) => {
        const amountInputOnSecurity = amountInputs[security.id];
        return (
          !!amountInputOnSecurity &&
          amountInputOnSecurity < security.minTradeAmount * security.fxRate
        );
      });

    const disableNext =
      round(sumOfAmountInputs) !== wizardData.data.amountToInvest ||
      isAnySelectedSecurityUnderMinAmount;

    const disableBack = false;
    setWizardData((prevState) => ({
      ...prevState,
      nextDisabled: disableNext,
      backDisabled: disableBack,
    }));
  }, [
    sumOfAmountInputs,
    setWizardData,
    wizardData.data.amountToInvest,
    wizardData.data.selectedSecurities,
    amountInputs,
  ]);

  return (
    <div className="flex flex-col gap-y-3">
      <Card id="investmentDistributionCard">
        <div className="flex flex-col gap-y-3 p-6">
          <p className="mx-auto text-lg font-bold">Investment distribution</p>
          <div className="flex gap-x-2 justify-between">
            <LabeledDiv id="investmentAmount" label="Investment amount">
              {wizardData?.data?.amountToInvest.toLocaleString(i18n.language, {
                style: "currency",
                currency: portfolioCurrencyCode,
              })}
            </LabeledDiv>
            <Button
              id="distributeEvenlyButton"
              onClick={distributeEvenly}
              variant="Secondary"
              size="xs"
            >
              Distribute evenly
            </Button>
          </div>
          <DistributeInfo
            diffAmount={
              wizardData.data?.amountToInvest - round(sumOfAmountInputs)
            }
            diffPercentage={100 - round(sumOfPercentageInputs)}
          />
        </div>
      </Card>
      <SecurityDistributionList
        selectedSecurities={wizardData.data.selectedSecurities}
        handleRemove={handleRemove}
        setInput={setInput}
        percentageInputs={percentageInputs}
        amountInputs={amountInputs}
        portfolioCurrencyCode={portfolioCurrencyCode}
      />
      <ConfirmDialog
        title="Are you sure?"
        description={`This will remove the security from your selection.`}
        confirmButtonText="Remove"
        cancelButtonText="Cancel"
        onConfirm={() => removeSecurity()}
        isOpen={confirmDialogOpen}
        setIsOpen={setConfirmDialogOpen}
      />
    </div>
  );
};

export default StepThree;
