import { TradableSecurity } from "api/trading/useGetTradebleSecurities";
import RenderWhenInView from "components/RenderWhenInView/RenderWhenInView";
import SecurityDistributionCard from "./SecurityDistributionCard";

interface SecurityDistributionListProps {
  selectedSecurities: TradableSecurity[];
  handleRemove: (security: TradableSecurity) => void;
  setInput: (input: string, securityId: number, mode: string) => void;
  percentageInputs: Record<string, number | undefined>;
  amountInputs: Record<string, number | undefined>;
  portfolioCurrencyCode: string;
}

const SecurityDistributionList: React.FC<SecurityDistributionListProps> = ({
  selectedSecurities,
  handleRemove,
  setInput,
  percentageInputs,
  amountInputs,
  portfolioCurrencyCode,
}) => {
  return (
    <ul
      id="securityDistributionList"
      className="flex overflow-y-auto flex-col gap-y-3 pb-4 h-full"
    >
      {selectedSecurities?.map((security: TradableSecurity) => {
        return (
          <RenderWhenInView key={security.id}>
            <SecurityDistributionCard
              security={security}
              handleRemove={handleRemove}
              setInput={setInput}
              percentageInputs={percentageInputs}
              amountInputs={amountInputs}
              portfolioCurrencyCode={portfolioCurrencyCode}
            />
          </RenderWhenInView>
        );
      })}
    </ul>
  );
};

export default SecurityDistributionList;
