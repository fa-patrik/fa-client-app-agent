import { TradableSecurity } from "api/trading/useGetTradebleSecurities";
import RenderWhenInView from "components/RenderWhenInView/RenderWhenInView";
import SecurityDistributionCard from "./SecurityDistributionCard";

interface SecurityDistributionListProps {
  selectedSecurities: TradableSecurity[];
  handleRemove: (security: TradableSecurity) => void;
  setInput: (input: string, securityId: number, mode: string) => void;
  percentageInputs: Record<string, string | undefined>;
  amountInputs: Record<string, string | undefined>;
  currency:
    | {
        securityCode: string;
        amountDecimalCount: number;
      }
    | undefined;
  id?: string;
}

const SecurityDistributionList: React.FC<SecurityDistributionListProps> = ({
  currency,
  selectedSecurities,
  handleRemove,
  setInput,
  percentageInputs,
  amountInputs,
  id,
}) => {
  return (
    <ul id={id} className="flex overflow-y-auto flex-col gap-y-3 pb-4 h-full">
      {selectedSecurities?.map((security: TradableSecurity, index) => {
        return (
          <RenderWhenInView key={security.id}>
            <SecurityDistributionCard
              id={id ? `${id}-row-${index}` : `row-${index}`}
              security={security}
              handleRemove={handleRemove}
              setInput={setInput}
              percentageInputs={percentageInputs}
              amountInputs={amountInputs}
              currency={currency}
            />
          </RenderWhenInView>
        );
      })}
    </ul>
  );
};

export default SecurityDistributionList;
