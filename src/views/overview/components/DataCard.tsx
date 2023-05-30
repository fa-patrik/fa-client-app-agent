import { ReactNode } from "react";
import classNames from "classnames";
import { useMatchesBreakpoint } from "hooks/useMatchesBreakpoint";
import { Tooltip } from "react-tooltip";
import {
  CardWithChartBackground,
  ColorScheme,
} from "./CardWithChartBackground";
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
              "text-sm font-normal text-gray-600 flex flex-row gap-2",
              {
                "text-gray-300": colorScheme === "black",
              }
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
            className={classNames("text-3xl font-medium text-gray-900", {
              "text-gray-200": colorScheme === "black",
            })}
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
