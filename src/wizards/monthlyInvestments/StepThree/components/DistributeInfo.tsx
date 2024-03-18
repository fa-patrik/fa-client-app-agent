import {
  faScaleUnbalanced,
  faScaleUnbalancedFlip,
} from "@fortawesome/free-solid-svg-icons";
import Alert from "components/Alert/Alert";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";

interface DistributeInfoProps {
  diffAmount: number;
  diffPercentage: number;
  /**
   * If provided, is displayed and sets the component style to error.
   */
  overrideError?: string;
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
}: DistributeInfoProps) => {
  const { i18n, t } = useModifiedTranslation();

  const diffAmountFormatted = diffAmount.toLocaleString(i18n.language, {
    style: "decimal",
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  });
  const diffPercentageFormatted = diffPercentage.toLocaleString(i18n.language, {
    style: "decimal",
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  });

  return (
    <>
      {overrideError ? (
        <Alert
          id="distributeInfo-alert-error"
          severity="Warning"
          content={overrideError}
          title={t("wizards.monthlyInvestments.stepThree.unableToProceed")}
        />
      ) : diffAmount > 0 ? (
        <Alert
          icon={faScaleUnbalanced}
          id="distributeInfo-alert-distributeMore"
          severity="Info"
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
          severity="Error"
          content={t("wizards.monthlyInvestments.stepThree.distributeLess")}
          title={t("wizards.monthlyInvestments.stepThree.distributeLessTitle")}
        />
      ) : (
        <Alert
          id="distributeInfo-alert-distributeOk"
          severity="Success"
          content={t("wizards.monthlyInvestments.stepThree.distributeOk")}
          title={t("wizards.monthlyInvestments.stepThree.distributedTitle")}
        />
      )}
    </>
  );
};
export default DistributeInfo;
