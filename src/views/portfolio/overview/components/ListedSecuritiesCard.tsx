import { ReactNode } from "react";
import { SecurityData } from "api/overview/types";
import { Card, GainLoseColoring } from "components";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { useNavigate } from "react-router";

interface ListedSecuritiesCardProps {
  securities: SecurityData[];
  label: ReactNode;
  currency: string | undefined;
}

export const ListedSecuritiesCard = ({
  securities,
  label,
  currency,
}: ListedSecuritiesCardProps) => {
  const { t } = useModifiedTranslation();
  const navigate = useNavigate();
  return (
    <Card header={label}>
      <div className="flex justify-between py-1 px-2 text-sm font-semibold text-gray-500 bg-gray-100">
        <div>{t("overviewPage.name")}</div>
        <div>{t("overviewPage.unrealizedProfits")}</div>
      </div>
      <div className="flex flex-col px-2 divide-y">
        {securities.map((security) => {
          const securityMarketValue = security?.firstAnalysis?.marketValue;
          const securityPurchaseValue = security?.firstAnalysis?.tradeAmount;
          const valueChange =
            securityMarketValue !== undefined &&
            securityPurchaseValue !== undefined
              ? securityMarketValue - securityPurchaseValue
              : undefined;
          return (
            <div
              key={security.security.id}
              className="flex justify-between items-center py-2 cursor-pointer"
              onClick={() => navigate(`holdings/${security.security.id}`)}
            >
              <div className="text-base font-normal">{security.name}</div>
              <div className="whitespace-nowrap">
                <GainLoseColoring value={valueChange}>
                  {valueChange !== undefined
                    ? t("numberWithCurrency", {
                        value: valueChange,
                        currency,
                        formatParams: {
                          value: { signDisplay: "always" },
                        },
                      })
                    : "-"}
                </GainLoseColoring>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
