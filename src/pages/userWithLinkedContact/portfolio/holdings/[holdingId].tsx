import { AllocationByType } from "api/holdings/types";
import { useGetPortfolioHoldings } from "api/holdings/useGetPortfolioHoldings";
import { useGetSecurityDetails } from "api/holdings/useGetSecurityDetails";
import { QueryLoadingWrapper } from "components";
import { useParams } from "react-router-dom";
import { HoldingDetails } from "views/holdingDetails/holdingDetails";
import { NotFoundView } from "views/notFoundView/notFoundView";

const findHolding = (
  holdingsGroupedByType: AllocationByType[] | undefined,
  securityId: string | undefined
) => {
  if (!holdingsGroupedByType || !securityId) return;
  for (const type of holdingsGroupedByType) {
    const holding = type.allocationsBySecurity?.find(
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
  } = useGetPortfolioHoldings(portfolioIdAsNr);

  const holding = findHolding(
    holdingData?.analytics.allocationTopLevel.allocationByType,
    holdingId
  );

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
