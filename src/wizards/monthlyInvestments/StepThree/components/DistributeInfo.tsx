import { ReactComponent as CheckIcon } from "assets/check.svg";
import { ReactComponent as CloseIcon } from "assets/close.svg";
import { ReactComponent as GlassHourIcon } from "assets/glassHour.svg";
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
          severity="Success"
          content={overrideError}
          title="Unable to proceed"
        />
      ) : diffAmount > 0 ? (
        <>
          <GlassHourIcon />
          <p
            className="text-xs"
            id="monthlyInvestmentsWizard-distributeMoreDisclaimer"
          >
            {t("wizards.monthlyInvestments.stepThree.distributeMore", {
              diffAmountFormatted,
              diffPercentageFormatted,
            })}
          </p>
        </>
      ) : diffAmount < 0 ? (
        <>
          <CloseIcon />
          <p
            className="text-xs"
            id="monthlyInvestmentsWizard-distributeLessDisclaimer"
          >
            {t("wizards.monthlyInvestments.stepThree.distributeLess")}
          </p>
        </>
      ) : (
        <>
          <CheckIcon />
          <p
            className="text-xs"
            id="monthlyInvestmentsWizard-distributeOkDisclaimer"
          >
            {t("wizards.monthlyInvestments.stepThree.distributeOk")}
          </p>
        </>
      )}
    </>
  );
};
export default DistributeInfo;
