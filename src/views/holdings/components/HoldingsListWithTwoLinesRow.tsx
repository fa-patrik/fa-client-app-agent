import { SecurityTypeCode } from "api/holdings/types";
import { GainLoseColoring, Grid } from "components";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { useNavigate } from "react-router";
import { GroupedHoldings, HoldingProps } from "./HoldingsGroupedByType";
import { NameWithFlag } from "./NameWithFlag";

export const HoldingsListWithTwoLinesRow = ({
  securities,
  groupCode,
  ...rest
}: GroupedHoldings) => {
  const { t } = useModifiedTranslation();
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-2 items-center">
      <Grid.Header>
        <span>{t("holdingsPage.name")}</span>
        <span>{t("holdingsPage.marketValue")}</span>
      </Grid.Header>
      {securities.map((security) => {
        const onClick =
          groupCode !== SecurityTypeCode.CURRENCY
            ? () => navigate(`holdings/${security.security.id}`)
            : undefined;
        const showFlag = groupCode !== SecurityTypeCode.CURRENCY;
        return (
          <HoldingBase
            {...security}
            key={security.security.id}
            onClick={onClick}
            showFlag={showFlag}
            {...rest}
          />
        );
      })}
    </div>
  );
};

const HoldingBase = ({
  name,
  code,
  security: { isinCode, countryCode },
  figures: { marketValue, tradeAmount },
  onClick,
  showFlag,
  currency,
}: HoldingProps) => {
  const { t } = useModifiedTranslation();
  const valueChange = marketValue - tradeAmount;
  return (
    <>
      <Grid.Row key={code} className="py-2 border-t" onClick={onClick}>
        <div className="col-span-2">
          <div className="flex gap-4 justify-between items-center text-left text-gray-800">
            <NameWithFlag
              name={name}
              countryCode={countryCode}
              showFlag={showFlag}
            />
            <div className="text-base font-medium">
              {t("numberWithCurrency", { value: marketValue, currency })}
            </div>
          </div>
          <div className="flex justify-between">
            <div className="text-xs md:text-base font-light">
              {isinCode || code || "-"}
            </div>
            <div className="text-xs md:text-base font-medium">
              <GainLoseColoring value={valueChange}>
                {t("numberWithCurrency", {
                  value: valueChange,
                  currency,
                  formatParams: {
                    value: { signDisplay: "always" },
                  },
                })}
              </GainLoseColoring>
            </div>
          </div>
        </div>
      </Grid.Row>
    </>
  );
};
