import { Button } from "components/Button/Button";
import { useMatchesBreakpoint } from "hooks/useMatchesBreakpoint";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import type { MappedPortfolio } from "hooks/useTaxWrapperPortfolioMapping";
import { Tooltip } from "react-tooltip";
import { QuestionmarkIcon } from "views/overview/components/PortfolioInfoCard";

// Progress Bar Component
const ProgressBar = ({
  used,
  total,
  color = "bg-green-600",
}: {
  used: number;
  total: number;
  color?: string;
}) => {
  const percentage = total > 0 ? Math.min((used / total) * 100, 100) : 0;

  return (
    <div className="overflow-hidden w-full h-2 bg-gray-200 rounded-full">
      <div
        className={`h-full ${color} transition-all duration-300 ease-out`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

// ISA Type Section Component
export const ISATypeSection = ({
  title,
  totalAmount,
  usedAmount,
  remainingAmount,
  currency,
  mappedPortfolios = [],
  onTopUp,
  isConstrainedByParent = false,
  parentRemainingAmount,
}: {
  title: string;
  totalAmount: number;
  usedAmount: number;
  remainingAmount: number;
  currency: string;
  mappedPortfolios?: MappedPortfolio[];
  onTopUp: (portfolio: MappedPortfolio) => void;
  isConstrainedByParent?: boolean;
  parentRemainingAmount?: number;
}) => {
  const { t } = useModifiedTranslation();
  const isMd = useMatchesBreakpoint("md");
  const isLg = useMatchesBreakpoint("lg");
  const isXl = useMatchesBreakpoint("xl");
  const showTooltip = isMd || isLg || isXl;

  return (
    <>
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </h3>

        {/* Total Amount (Mobile) */}
        <div className="md:hidden">
          <div className="text-sm text-gray-600">
            {t("taxesPage.totalLabel")}
          </div>
          <div className="text-base font-medium text-gray-900 dark:text-gray-100">
            {t("numberWithCurrencyNoDecimals", {
              value: totalAmount,
              currency,
            })}
          </div>
        </div>

        {/* Progress bar */}
        <ProgressBar used={usedAmount} total={totalAmount} />

        {/* Data rows */}
        <div className="flex justify-between items-start pt-1">
          {/* Total Amount (Desktop) */}
          <div className="hidden md:block text-left">
            <div className="text-sm text-gray-600">
              {t("taxesPage.totalLabel")}
            </div>
            <div className="text-base font-medium text-gray-900 dark:text-gray-100">
              {t("numberWithCurrencyNoDecimals", {
                value: totalAmount,
                currency,
              })}
            </div>
          </div>

          <div className="text-left md:text-center">
            <div className="text-sm text-gray-600">
              {t("taxesPage.usedLabel")}
            </div>
            <div className="text-base font-medium text-gray-900 dark:text-gray-100">
              {t("numberWithCurrencyNoDecimals", {
                value: usedAmount,
                currency,
              })}
            </div>
          </div>

          <div className="text-right">
            <div className="flex flex-row gap-x-2 justify-end">
              <div className="text-sm text-gray-700">
                {t("taxesPage.remainingLabel")}
              </div>
              {isConstrainedByParent && showTooltip && (
                <div data-tooltip-id="isaConstraintTooltip">
                  <QuestionmarkIcon />
                </div>
              )}
            </div>
            <div className="text-base font-semibold text-green-600">
              {t("numberWithCurrencyNoDecimals", {
                value: remainingAmount,
                currency,
              })}
            </div>
          </div>
        </div>

        {/* Portfolio and Top Up section */}
        <div className="p-3 mt-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          {mappedPortfolios.length > 0 ? (
            mappedPortfolios.map((portfolio, index) => (
              <div
                key={portfolio.id}
                className={`flex justify-between items-center ${index > 0 ? "mt-2 pt-2 border-t border-gray-200" : ""}`}
              >
                <span className="text-sm text-gray-700">{portfolio.name}</span>
                <Button
                  variant="Primary"
                  size="xs"
                  onClick={() => onTopUp(portfolio)}
                >
                  {t("taxesPage.topUpButton")}
                </Button>
              </div>
            ))
          ) : (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">
                {t("taxesPage.noPortfoliosAvailable")}
              </span>
              <Button variant="Primary" size="xs" disabled>
                {t("taxesPage.topUpButton")}
              </Button>
            </div>
          )}
        </div>
      </div>
      {isConstrainedByParent &&
        showTooltip &&
        parentRemainingAmount !== undefined && (
          <Tooltip
            id="isaConstraintTooltip"
            content={t("taxesPage.constraintTooltip", {
              value: parentRemainingAmount,
              currency,
            })}
            className="max-w-xs translate-y-[-30px]"
          />
        )}
    </>
  );
};
