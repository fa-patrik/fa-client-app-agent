import { useGetContactHoldingsFromAnalytics } from "api/holdings/useGetContactHoldingsFromAnalytics";
import { QueryLoadingWrapper } from "components";
import { Holdings } from "views/holdings/holdings";

export const HoldingsPage = () => {
  const queryData = useGetContactHoldingsFromAnalytics();

  return <QueryLoadingWrapper {...queryData} SuccessComponent={Holdings} />;
};
