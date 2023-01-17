import { SecurityTypeCode } from "api/holdings/types";
import classNames from "classnames";
import { Button, GainLoseColoring, Grid } from "components";
import { useMatchesBreakpoint } from "hooks/useMatchesBreakpoint";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { useNavigate } from "react-router";
import { getGridColsClass } from "utils/tailwindClasses";
import { tradableTag } from "../../../services/permissions/trade";
import { GroupedHoldings, HoldingProps } from "./HoldingsGroupedByType";
import { NameWithFlag } from "./NameWithFlag";

export const HoldingsListWithOneLineRow = ({
  securities,
  groupCode,
  currency,
  tradeProps,
}: GroupedHoldings) => {
  const { canTrade } = tradeProps;
  const { t } = useModifiedTranslation();
  const navigate = useNavigate();

  const isLgVersion = useMatchesBreakpoint("lg");
  const isXlVersion = useMatchesBreakpoint("xl");

  const headersList = [
    t("holdingsPage.name"),
    groupCode === SecurityTypeCode.CURRENCY
      ? t("holdingsPage.accountNumber")
      : t("holdingsPage.isinCode"),
    ...(isLgVersion ? [t("holdingsPage.units")] : []),
    ...(isXlVersion ? [t("holdingsPage.purchaseValue")] : []),
    t("holdingsPage.marketValue"),
    t("holdingsPage.unrealizedProfits"),
  ];

  return (
    <div className={`grid ${getGridColsClass(headersList.length + 1)}`}>
      <Grid.Header>
        {headersList.map((header, index) => (
          <div
            key={index}
            className={
              index === 0 ? `col-span-2 ${canTrade ? "pl-[102px]" : ""}` : ""
            }
          >
            {header}
          </div>
        ))}
      </Grid.Header>
      {securities.map((security) => {
        const onClick =
          groupCode !== SecurityTypeCode.CURRENCY
            ? () => navigate(`holdings/${security.security.id}`)
            : undefined;
        const showFlag = groupCode !== SecurityTypeCode.CURRENCY;
        return (
          <HoldingLg
            {...security}
            key={security.security.id}
            onClick={onClick}
            currency={currency}
            showFlag={showFlag}
            tradeProps={tradeProps}
          />
        );
      })}
    </div>
  );
};

const HoldingLg = ({
  name,
  code,
  security,
  figures: { marketValue, tradeAmount, amount, purchaseTradeAmount },
  onClick,
  showFlag,
  currency,
  tradeProps,
}: HoldingProps) => {
  const { isinCode, countryCode, tagsAsList } = security;
  const { canTrade, onBuyModalOpen, onSellModalOpen } = tradeProps;
  const isTradable = tagsAsList.includes(tradableTag);
  const { t } = useModifiedTranslation();
  //no isin comes back as " "
  const codeToDisplay = isinCode && isinCode !== " " ? isinCode : code ?? "-";
  const isLgVersion = useMatchesBreakpoint("lg");
  const isXlVersion = useMatchesBreakpoint("xl");

  const valueChange = marketValue - tradeAmount;
  return (
    <>
      <Grid.Row key={code} className="py-2 border-t" onClick={onClick}>
        <div
          className={classNames("col-span-2", {
            "grid gap-3 grid-cols-[84px_auto]": canTrade,
          })}
        >
          {canTrade && isTradable && (
            <div className="flex gap-2 items-start">
              <Button
                size="xs"
                onClick={(e) => {
                  e.stopPropagation();
                  onBuyModalOpen(security);
                }}
              >
                {t("holdingsPage.buyButton")}
              </Button>
              <Button
                size="xs"
                variant="Red"
                onClick={(e) => {
                  e.stopPropagation();
                  onSellModalOpen(security);
                }}
              >
                {t("holdingsPage.sellButton")}
              </Button>
            </div>
          )}
          {canTrade && !isTradable && <div className="text-center grow">-</div>}
          <NameWithFlag
            name={name}
            countryCode={countryCode}
            showFlag={showFlag}
          />
        </div>
        <div className="text-xs md:text-base font-light">{codeToDisplay}</div>
        {isLgVersion && (
          <div className="text-base font-medium">
            {t("number", { value: amount })}
          </div>
        )}
        {isXlVersion && (
          <div className="text-base font-medium">
            {t("numberWithCurrency", {
              value: purchaseTradeAmount,
              currency: currency,
            })}
          </div>
        )}
        <div className="text-base font-medium">
          {t("numberWithCurrency", { value: marketValue, currency })}
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
      </Grid.Row>
    </>
  );
};
