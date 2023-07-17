import {
  SecurityData,
  SecurityTypeDataWithSecurityData,
} from "api/overview/types";
import { Card, GainLoseColoring } from "components";
import { BuyModalInitialData } from "components/TradingModals/BuyModalContent/BuyModalContent";
import { SellModalInitialData } from "components/TradingModals/SellModalContent/SellModalContent";
import { useMatchesBreakpoint } from "hooks/useMatchesBreakpoint";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { HoldingsListWithOneLineRow } from "./HoldingsListWithOneLineRow";
import { HoldingsListWithTwoLinesRow } from "./HoldingsListWithTwoLinesRow";

interface TradeProps {
  canTrade: boolean;
  onBuyModalOpen: (initialData?: BuyModalInitialData) => void;
  onSellModalOpen: (initialData?: SellModalInitialData) => void;
}

interface HoldingsGroupedByTypeProps extends SecurityTypeDataWithSecurityData {
  currency: string;
  tradeProps: TradeProps;
}

export interface GroupedHoldings {
  securities: SecurityData[];
  groupCode: string;
  currency: string;
  tradeProps: TradeProps;
}

export interface HoldingProps extends SecurityData {
  onClick?: () => void;
  showFlag: boolean;
  currency: string;
  tradeProps: TradeProps;
}

export const HoldingsGroupedByType = ({
  name,
  firstAnalysis: {
    marketValue: groupMarketValue,
    tradeAmount: groupTradeAmount,
  },
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
          marketValue={groupMarketValue}
          tradeAmount={groupTradeAmount}
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
  currency: string;
  marketValue: number;
  tradeAmount: number;
}

const TypeHeader = ({
  name,
  marketValue,
  tradeAmount,
  currency,
}: TypeHeaderProps) => {
  const { t } = useModifiedTranslation();
  const valueChange = marketValue - tradeAmount;
  return (
    <div className="flex justify-between items-center">
      <div className="leading-none">{name}</div>
      <div className="text-right">
        <div className="text-base font-bol">
          {t("numberWithCurrency", {
            value: marketValue,
            currency,
          })}
        </div>
        <div className="text-sm font-medium">
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
  );
};
