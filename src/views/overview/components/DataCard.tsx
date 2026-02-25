import type { ReactNode } from "react";
import classNames from "classnames";
import { useMatchesBreakpoint } from "hooks/useMatchesBreakpoint";
import { Tooltip } from "react-tooltip";
import type { ColorScheme } from "./CardWithChartBackground";
import { CardWithChartBackground } from "./CardWithChartBackground";
import { QuestionmarkIcon } from "./PortfolioInfoCard";

interface DataCardProps {
  value: ReactNode;
  label: string;
  toolTipContent?: string;
  colorScheme?: ColorScheme;
}

export const DataCard = ({
  value,
  label,
  colorScheme,
  toolTipContent,
}: DataCardProps) => {
  const isMd = useMatchesBreakpoint("md");
  const isLg = useMatchesBreakpoint("lg");
  const isXl = useMatchesBreakpoint("xl");
  const showTooltip = isMd || isLg || isXl;
  return (
    <>
      <CardWithChartBackground colorScheme={colorScheme}>
        <div className="relative p-4">
          <div
            className={classNames(
              "text-sm font-normal flex flex-row gap-2",
              colorScheme === "black"
                ? "text-gray-300"
                : "text-gray-600 dark:text-gray-400"
            )}
          >
            {label}
            {showTooltip && toolTipContent && (
              <div data-tooltip-id="dataCardToolTip">
                <QuestionmarkIcon />
              </div>
            )}
          </div>
          <div
            className={classNames(
              "text-3xl font-medium",
              colorScheme === "black"
                ? "text-gray-200"
                : "text-gray-900 dark:text-gray-100"
            )}
          >
            {value}
          </div>
        </div>
      </CardWithChartBackground>
      {showTooltip && toolTipContent && (
        <Tooltip
          id="dataCardToolTip"
          content={toolTipContent}
          style={{ maxWidth: 250 }}
        />
      )}
    </>
  );
};
