import {
  faScaleUnbalanced,
  faScaleUnbalancedFlip,
} from "@fortawesome/free-solid-svg-icons";
import Alert, { Severity } from "components/Alert/Alert";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";

interface DistributeInfoProps {
  diffAmount: number;
  diffPercentage: number;
  /**
   * If provided, is displayed and sets the component style to error.
   */
  overrideError?: string;
  currencyDecimalCount: number;
}

/**
 * Displays guiding messages towards the user
 * depending on if diffAmount is larger, less than or equal to 0.
 * @param diffAmount amount differing from target amount.
 * @param diffPercentage percentage differing from target amount (10 => 10%).
 */
const DistributeInfo = ({
  diffAmount,
  diffPercentage,
  overrideError,
  currencyDecimalCount,
}: DistributeInfoProps) => {
  const { t } = useModifiedTranslation();

  const diffAmountFormatted = t("number", {
    value: diffAmount,
    maximumFractionDigits: currencyDecimalCount,
    minimumFractionDigits: currencyDecimalCount,
  });

  const diffPercentageFormatted = t("number", {
    value: diffPercentage,
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });

  return (
    <>
      {overrideError ? (
        <Alert
          id="distributeInfo-alert-error"
          severity={Severity.Error}
          content={overrideError}
          title={t("wizards.monthlyInvestments.stepThree.unableToProceed")}
        />
      ) : diffAmount > 0 ? (
        <Alert
          icon={faScaleUnbalanced}
          id="distributeInfo-alert-distributeMore"
          severity={Severity.Info}
          content={t("wizards.monthlyInvestments.stepThree.distributeMore", {
            diffAmountFormatted,
            diffPercentageFormatted,
          })}
          title={t("wizards.monthlyInvestments.stepThree.distributeMoreTitle")}
        />
      ) : diffAmount < 0 ? (
        <Alert
          icon={faScaleUnbalancedFlip}
          id="distributeInfo-alert-distributeLess"
          severity={Severity.Error}
          content={t("wizards.monthlyInvestments.stepThree.distributeLess")}
          title={t("wizards.monthlyInvestments.stepThree.distributeLessTitle")}
        />
      ) : (
        <Alert
          id="distributeInfo-alert-distributeOk"
          severity={Severity.Success}
          content={t("wizards.monthlyInvestments.stepThree.distributeOk")}
          title={t("wizards.monthlyInvestments.stepThree.distributedTitle")}
        />
      )}
    </>
  );
};
export default DistributeInfo;
