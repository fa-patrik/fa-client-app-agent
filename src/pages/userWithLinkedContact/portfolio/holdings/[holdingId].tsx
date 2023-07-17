import { useGetSecurityDetails } from "api/holdings/useGetSecurityDetails";
import { SecurityTypeDataWithSecurityData } from "api/overview/types";
import { useGetPortfolioOverviewSmart } from "api/overview/useGetPortfolioOverviewSmart";
import { QueryLoadingWrapper } from "components";
import { useParams } from "react-router-dom";
import { HoldingDetails } from "views/holdingDetails/holdingDetails";
import { NotFoundView } from "views/notFoundView/notFoundView";

const findHolding = (
  holdingsGroupedByType: SecurityTypeDataWithSecurityData[] | undefined,
  securityId: string | undefined
) => {
  if (!holdingsGroupedByType || !securityId) return;
  for (const type of holdingsGroupedByType) {
    const holding = type.securities?.find(
      (holding) => holding?.security?.id?.toString() === securityId
    );
    if (holding) return holding;
  }
};

export const HoldingPage = () => {
  const { holdingId, portfolioId } = useParams();
  const portfolioIdAsNr = portfolioId ? parseInt(portfolioId, 10) : undefined;
  const {
    loading: securityLoading,
    error: securityError,
    data: securityData,
  } = useGetSecurityDetails(holdingId);
  const {
    loading: holdingLoading,
    error: holdingError,
    data: holdingData,
  } = useGetPortfolioOverviewSmart(portfolioIdAsNr);

  const holding = findHolding(holdingData?.securityTypes, holdingId);

  // marge data are ready when:
  // 1) there are securityData (cached or fresh) and
  // 2) holdingData finishes loading or we have cached holdingData
  const mergedData =
    (!holdingLoading || holding) && securityData
      ? {
          holding: holding,
          security: securityData,
        }
      : undefined;
  const isLoading = securityLoading || holdingLoading;
  const securityDoesNotExist = !isLoading && !securityData;

  return securityDoesNotExist ? (
    <NotFoundView />
  ) : (
    <QueryLoadingWrapper
      loading={isLoading}
      data={mergedData}
      error={securityError || holdingError}
      SuccessComponent={HoldingDetails}
    />
  );
};
