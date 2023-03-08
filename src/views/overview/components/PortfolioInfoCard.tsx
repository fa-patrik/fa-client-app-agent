import { ReactNode } from "react";
import { BaseReport } from "api/overview/types";
import classNames from "classnames";
import { GainLoseColoring } from "components";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { useNavigate, useParams } from "react-router-dom";
import {
  ColorScheme,
  CardWithChartBackground,
} from "./CardWithChartBackground";

interface PortfolioInfoCardProps extends BaseReport {
  name: string;
  colorScheme?: ColorScheme;
  id?: number;
}

export const PortfolioInfoCard = ({
  marketValue,
  valueChangeAbsolute,
  accountBalance,
  portfolio: {
    currency: { securityCode },
  },
  name,
  colorScheme = "gray",
  id,
}: PortfolioInfoCardProps) => {
  const { t } = useModifiedTranslation();
  const navigate = useNavigate();
  const { contactDbId } = useParams();

  const navigateToPortfolioDetails = () => {
    if (!id) {
      return;
    }
    let path = `/portfolio/${id}/`;
    if (contactDbId) path = `/impersonate/${contactDbId}${path}`;
    navigate(path);
  };

  return (
    <CardWithChartBackground
      onClick={navigateToPortfolioDetails}
      colorScheme={colorScheme}
    >
      <div className="relative p-4">
        <div className="mb-5 text-xl font-bold">{name}</div>
        <div className="mb-2">
          <Label colorScheme={colorScheme}>
            {t("portfolioSummary.currentMarketValue")}
          </Label>
          <div className="text-3xl font-medium">
            {t("numberWithCurrencyRounded", {
              value: marketValue,
              currency: securityCode,
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
              <GainLoseColoring value={valueChangeAbsolute}>
                {t("numberWithCurrencyRounded", {
                  value: valueChangeAbsolute,
                  currency: securityCode,
                  formatParams: {
                    value: { signDisplay: "always" },
                  },
                })}
              </GainLoseColoring>
            </div>
          </div>
          {!isNaN(accountBalance) && (
            <div className="text-right">
              <Label colorScheme={colorScheme}>
                {t("portfolioSummary.availableCash")}
              </Label>
              <div className="text-lg font-semibold">
                {t("numberWithCurrencyRounded", {
                  value: accountBalance,
                  currency: securityCode,
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </CardWithChartBackground>
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
