import { useGetContactHoldings } from "api/holdings/useGetContactHoldings";
import { QueryLoadingWrapper } from "components";
import { Holdings } from "views/holdings/holdings";

export const HoldingsPage = () => {
  const queryData = useGetContactHoldings();

  return <QueryLoadingWrapper {...queryData} SuccessComponent={Holdings} />;
};
