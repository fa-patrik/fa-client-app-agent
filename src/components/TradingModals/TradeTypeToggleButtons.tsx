import { useModifiedTranslation } from "hooks/useModifiedTranslation";

interface TradeTypeToggleButtonsProps {
  canToggleTradeType: boolean;
  setIsTradeInUnits: (isTradeInUnits: boolean) => void;
  isTradeInUnits: boolean;
}

const TradeTypeToggleButtons = ({
  canToggleTradeType,
  setIsTradeInUnits,
  isTradeInUnits,
}: TradeTypeToggleButtonsProps) => {
  const { t } = useModifiedTranslation();
  return (
    <div className="flex overflow-hidden font-medium leading-5 bg-gray-50 rounded-md divide-x ring-1 shadow-sm pointer-events-auto select-none divide-slate-400/20 text-[0.8125rem] ring-slate-700/10">
      <button
        disabled={!canToggleTradeType}
        className={`text-center cursor-pointer py-2 px-4 flex-1 ${
          isTradeInUnits ? "bg-gray-200" : ""
        } ${!canToggleTradeType ? "opacity-50 cursor-not-allowed" : ""}`}
        onClick={() => {
          if (canToggleTradeType) {
            setIsTradeInUnits(true);
          }
        }}
      >
        {t("tradingModal.unitsButtonLabel")}
      </button>

      <button
        className={`text-center cursor-pointer py-2 px-4 flex-1 ${
          !isTradeInUnits ? "bg-gray-200" : ""
        } ${!canToggleTradeType ? "opacity-50 cursor-not-allowed" : ""}`}
        disabled={!canToggleTradeType}
        onClick={() => {
          if (canToggleTradeType) {
            setIsTradeInUnits(false);
          }
        }}
      >
        {t("tradingModal.tradeAmountButtonLabel")}
      </button>
    </div>
  );
};

export default TradeTypeToggleButtons;
