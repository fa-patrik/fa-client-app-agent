import { useGetContactOverview } from "api/overview/useGetContactOverview";
import { QueryLoadingWrapper } from "components";
import { Holdings } from "views/holdings/holdings";

export const HoldingsPage = () => {
  const queryData = useGetContactOverview();

  return <QueryLoadingWrapper {...queryData} SuccessComponent={Holdings} />;
};
