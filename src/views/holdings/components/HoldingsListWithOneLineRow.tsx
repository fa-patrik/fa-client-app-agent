import { SecurityTypeCode } from "api/holdings/types";
import classNames from "classnames";
import { Button, GainLoseColoring, Grid } from "components";
import { useMatchesBreakpoint } from "hooks/useMatchesBreakpoint";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { useNavigate } from "react-router";
import { useParams } from "react-router-dom";
import { useCanTradeSecurities } from "services/permissions/trading";
import { getGridColsClass } from "utils/tailwindClasses";
import { GroupedHoldings, HoldingProps } from "./HoldingsGroupedByType";
import { NameWithFlag } from "./NameWithFlag";

export const HoldingsListWithOneLineRow = ({
  securities,
  groupCode,
  currency,
  tradeProps,
}: GroupedHoldings) => {
  const { canAnyHoldingSwitch, canTrade } = tradeProps;
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
            className={classNames("", {
              "col-span-2": index === 0,
              "pl-[169px]": index === 0 && canTrade && canAnyHoldingSwitch,
              "pl-[102px]": index === 0 && canTrade && !canAnyHoldingSwitch,
            })}
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
  firstAnalysis,
  onClick,
  showFlag,
  currency,
  tradeProps,
}: HoldingProps) => {
  const { isinCode, countryCode } = security;
  const {
    canTrade,
    onBuyModalOpen,
    onSellModalOpen,
    onSwitchModalOpen,
    canAnyHoldingSwitch,
  } = tradeProps;
  const { t } = useModifiedTranslation();
  //no isin comes back as " "
  const codeToDisplay = isinCode && isinCode !== " " ? isinCode : code ?? "-";
  const isLgVersion = useMatchesBreakpoint("lg");
  const isXlVersion = useMatchesBreakpoint("xl");
  const { portfolioId } = useParams();
  const portfolioIdNumber = portfolioId ? parseInt(portfolioId, 10) : undefined;
  const hasSelectedPortfolio = !!portfolioIdNumber;
  const { canSwitchAnyHolding, canTradeAnyHolding } = useCanTradeSecurities(
    security ? [security] : [],
    portfolioIdNumber
  );

  const valueChange =
    firstAnalysis?.marketValue !== undefined &&
    firstAnalysis?.tradeAmount !== undefined
      ? firstAnalysis.marketValue - firstAnalysis.tradeAmount
      : undefined;
  return (
    <>
      <Grid.Row key={code} className="py-2 border-t" onClick={onClick}>
        <div
          className={classNames("col-span-2", {
            "grid gap-3 grid-cols-[148px_auto]":
              hasSelectedPortfolio && canTrade && canAnyHoldingSwitch,
            "grid gap-3 grid-cols-[84px_auto]":
              hasSelectedPortfolio && canTrade && !canAnyHoldingSwitch,
          })}
        >
          {hasSelectedPortfolio && canTradeAnyHolding && (
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
              {hasSelectedPortfolio && canSwitchAnyHolding && (
                <Button
                  size="xs"
                  variant="Dark"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSwitchModalOpen({
                      sellSecurityId: security.id,
                    });
                  }}
                >
                  {t("holdingsPage.switchButton")}
                </Button>
              )}
            </div>
          )}
          {!canTradeAnyHolding && <div className="text-center grow"></div>}
          <NameWithFlag
            name={name}
            countryCode={countryCode}
            showFlag={showFlag}
          />
        </div>
        <div className="text-xs md:text-base font-light">{codeToDisplay}</div>
        {isLgVersion && (
          <div className="text-base font-medium">
            {firstAnalysis?.amount !== undefined
              ? t("number", { value: firstAnalysis?.amount })
              : "-"}
          </div>
        )}
        {isXlVersion && (
          <div className="text-base font-medium">
            {firstAnalysis?.purchaseTradeAmount !== undefined
              ? t("numberWithCurrency", {
                  value: firstAnalysis?.purchaseTradeAmount,
                  currency: currency,
                })
              : "-"}
          </div>
        )}
        <div className="text-base font-medium">
          {firstAnalysis?.marketValue !== undefined
            ? t("numberWithCurrency", {
                value: firstAnalysis?.marketValue,
                currency,
              })
            : "-"}
        </div>
        <div className="text-xs md:text-base font-medium">
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
      </Grid.Row>
    </>
  );
};
