import { useGetContactHoldingsFromAnalytics } from "api/holdings/useGetContactHoldingsFromAnalytics";
import { QueryLoadingWrapper } from "components";
import { Holdings } from "views/holdings/holdings";

export const HoldingsPage = () => {
  const analytics = useGetContactHoldingsFromAnalytics();

  return (
    <QueryLoadingWrapper
      loading={analytics.loading}
      error={analytics.error}
      data={analytics.data}
      SuccessComponent={Holdings}
    />
  );
};
