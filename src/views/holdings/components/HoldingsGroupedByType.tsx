import {
  SecurityData,
  SecurityTypeDataWithSecurityData,
} from "api/overview/types";
import { Card, GainLoseColoring } from "components";
import { BuyModalInitialData } from "components/TradingModals/BuyModalContent/BuyModalContent";
import { SellModalInitialData } from "components/TradingModals/SellModalContent/SellModalContent";
import { SwitchModalInitialData } from "components/TradingModals/SwitchModalContent/SwitchModalContent";
import { useMatchesBreakpoint } from "hooks/useMatchesBreakpoint";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { HoldingsListWithOneLineRow } from "./HoldingsListWithOneLineRow";
import { HoldingsListWithTwoLinesRow } from "./HoldingsListWithTwoLinesRow";

interface TradeProps {
  canTrade: boolean;
  canAnyHoldingSwitch: boolean;
  onBuyModalOpen: (initialData?: BuyModalInitialData) => void;
  onSellModalOpen: (initialData?: SellModalInitialData) => void;
  onSwitchModalOpen: (initialData?: SwitchModalInitialData) => void;
}

interface HoldingsGroupedByTypeProps extends SecurityTypeDataWithSecurityData {
  currency: string | undefined;
  tradeProps: TradeProps;
}

export interface GroupedHoldings {
  securities: SecurityData[];
  groupCode: string;
  currency: string | undefined;
  tradeProps: TradeProps;
}

export interface HoldingProps extends SecurityData {
  onClick?: () => void;
  showFlag: boolean;
  currency: string | undefined;
  tradeProps: TradeProps;
}

export const HoldingsGroupedByType = ({
  name,
  firstAnalysis,
  securities,
  currency,
  code: groupCode,
  tradeProps,
}: HoldingsGroupedByTypeProps) => {
  const hasOneLineRow = useMatchesBreakpoint("md");

  const HoldingsList = hasOneLineRow
    ? HoldingsListWithOneLineRow
    : HoldingsListWithTwoLinesRow;

  return (
    <Card
      header={
        <TypeHeader
          name={name}
          marketValue={firstAnalysis?.marketValue}
          tradeAmount={firstAnalysis?.tradeAmount}
          currency={currency}
        />
      }
    >
      <HoldingsList
        securities={securities}
        groupCode={groupCode}
        currency={currency}
        tradeProps={tradeProps}
      />
    </Card>
  );
};

interface TypeHeaderProps {
  name: string;
  currency: string | undefined;
  marketValue: number | undefined;
  tradeAmount: number | undefined;
}

const TypeHeader = ({
  name,
  marketValue,
  tradeAmount,
  currency,
}: TypeHeaderProps) => {
  const { t } = useModifiedTranslation();
  const valueChange =
    marketValue !== undefined && tradeAmount !== undefined
      ? marketValue - tradeAmount
      : undefined;
  return (
    <div className="flex justify-between items-center">
      <div className="leading-none">{name}</div>
      <div className="text-right">
        <div className="text-base font-bol">
          {marketValue !== undefined
            ? t("numberWithCurrency", {
                value: marketValue,
                currency,
              })
            : "-"}
        </div>
        <div className="text-sm font-medium">
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
    </div>
  );
};
