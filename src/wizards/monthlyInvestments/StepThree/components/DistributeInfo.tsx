import { ReactComponent as CheckIcon } from "assets/check.svg";
import { ReactComponent as CloseIcon } from "assets/close.svg";
import { ReactComponent as GlassHourIcon } from "assets/glassHour.svg";
import classNames from "classnames";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";

interface DistributeInfoProps {
  diffAmount: number;
  diffPercentage: number;
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
    <div
      id="distibuteInfo"
      className={classNames(
        "flex flex-row gap-x-4 items-center py-4 px-6 rounded-lg h-14 max-w-sm",
        {
          "bg-primary-200": diffAmount > 0,
          "bg-green-300": diffAmount === 0,
          "bg-red-400": diffAmount < 0,
        }
      )}
    >
      {diffAmount > 0 ? (
        <>
          <GlassHourIcon />
          <p className="text-xs">
            {t("wizards.monthlyInvestments.stepThree.distributeMore", {
              diffAmountFormatted,
              diffPercentageFormatted,
            })}
          </p>
        </>
      ) : diffAmount < 0 ? (
        <>
          <CloseIcon />
          <p className="text-xs">
            {t("wizards.monthlyInvestments.stepThree.distributeLess")}
          </p>
        </>
      ) : (
        <>
          <CheckIcon />
          <p className="text-xs">
            {t("wizards.monthlyInvestments.stepThree.distributeOk")}
          </p>
        </>
      )}
    </div>
  );
};
export default DistributeInfo;
