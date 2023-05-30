import { ReactNode } from "react";
import { useGetPortfolioBasicFieldsById } from "api/generic/useGetPortfolioBasicFieldsById";
import classNames from "classnames";
import { GainLoseColoring } from "components";
import { useMatchesBreakpoint } from "hooks/useMatchesBreakpoint";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { useNavigate, useParams } from "react-router-dom";
import { Tooltip } from "react-tooltip";
import {
  ColorScheme,
  CardWithChartBackground,
} from "./CardWithChartBackground";

interface PortfolioInfoCardProps {
  name?: string;
  colorScheme?: ColorScheme;
  portfolioId?: number;
  marketValue: number;
  currencyCode: string;
  tradeAmount: number;
  currentBalance?: number;
}

export const QuestionmarkIcon = ({ w, h }: { w?: string; h?: string }) => (
  <svg
    onClick={(event: React.MouseEvent) => event.stopPropagation()}
    className="transition-transform hover:scale-110 cursor-help stroke-gray-500"
    width={w ?? "16"}
    height={h ?? "16"}
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M6.228 7C6.777 5.835 8.258 5 10 5C12.21 5 14 6.343 14 8C14 9.4 12.722 10.575 10.994 10.907C10.452 11.011 10 11.447 10 12M10 15H10.01M19 10C19 11.1819 18.7672 12.3522 18.3149 13.4442C17.8626 14.5361 17.1997 15.5282 16.364 16.364C15.5282 17.1997 14.5361 17.8626 13.4442 18.3149C12.3522 18.7672 11.1819 19 10 19C8.8181 19 7.64778 18.7672 6.55585 18.3149C5.46392 17.8626 4.47177 17.1997 3.63604 16.364C2.80031 15.5282 2.13738 14.5361 1.68508 13.4442C1.23279 12.3522 1 11.1819 1 10C1 7.61305 1.94821 5.32387 3.63604 3.63604C5.32387 1.94821 7.61305 1 10 1C12.3869 1 14.6761 1.94821 16.364 3.63604C18.0518 5.32387 19 7.61305 19 10Z"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const PortfolioInfoCard = ({
  currencyCode = "EUR",
  currentBalance = 0,
  tradeAmount = 0,
  marketValue = 0,
  name,
  colorScheme = "gray",
  portfolioId,
}: PortfolioInfoCardProps) => {
  const { t } = useModifiedTranslation();
  const navigate = useNavigate();
  const { contactDbId } = useParams();
  const { data: portfolioData } = useGetPortfolioBasicFieldsById(portfolioId);
  const isMd = useMatchesBreakpoint("md");
  const isLg = useMatchesBreakpoint("lg");
  const isXl = useMatchesBreakpoint("xl");
  const showTooltipIcon = isMd || isLg || isXl;

  const navigateToPortfolioDetails = () => {
    if (!portfolioId) {
      return;
    }
    let path = `/portfolio/${portfolioId}/`;
    if (contactDbId) path = `/impersonate/${contactDbId}${path}`;
    navigate(path);
  };
  const valueChange = marketValue - tradeAmount;
  return (
    <>
      <CardWithChartBackground
        onClick={navigateToPortfolioDetails}
        colorScheme={colorScheme}
      >
        <div className="relative p-4">
          <div className="mb-5 text-xl font-bold">
            {name ?? portfolioData?.name}
          </div>
          <div className="mb-2">
            <Label colorScheme={colorScheme}>
              {t("portfolioSummary.currentMarketValue")}
            </Label>
            <div className="text-3xl font-medium">
              {t("numberWithCurrencyRounded", {
                value: marketValue,
                currency: currencyCode,
                maximumFractionDigits: 0,
              })}
            </div>
          </div>
          <div className="flex justify-between">
            <div>
              <Label colorScheme={colorScheme}>
                {t("portfolioSummary.unrealizedProfits")}
              </Label>
              <div className="text-lg font-semibold ">
                <GainLoseColoring value={valueChange}>
                  {t("numberWithCurrencyRounded", {
                    value: valueChange,
                    currency: currencyCode,
                    formatParams: {
                      value: { signDisplay: "always" },
                    },
                  })}
                </GainLoseColoring>
              </div>
            </div>
            <div className="text-right">
              <div className="flex flex-row gap-x-2">
                <Label colorScheme={colorScheme}>
                  {t("portfolioSummary.currentBalance")}
                </Label>
                {showTooltipIcon && (
                  <div data-tooltip-id="currentBalanceTooltip">
                    <QuestionmarkIcon />
                  </div>
                )}
              </div>
              <div className="text-lg font-semibold">
                {t("numberWithCurrencyRounded", {
                  value: currentBalance,
                  currency: currencyCode,
                })}
              </div>
            </div>
          </div>
        </div>
      </CardWithChartBackground>
      {showTooltipIcon && (
        <Tooltip
          id="currentBalanceTooltip"
          content={t("portfolioSummary.currentBalanceTooltip")}
          style={{ maxWidth: 250 }}
        />
      )}
    </>
  );
};

interface LabelProps {
  children: ReactNode;
  colorScheme: ColorScheme;
}

const Label = ({ children, colorScheme }: LabelProps) => (
  <div
    className={classNames("text-xs font-normal", {
      "text-gray-300": colorScheme === "black",
      "text-gray-600": ["gray", "blue"].includes(colorScheme),
    })}
  >
    {children}
  </div>
);
