import { useMemo } from "react";
import {
  Portfolio,
  PortfolioGroups,
  useGetContactInfo,
} from "api/initial/useGetContactInfo";
import { PortfolioOption } from "components/PortfolioSelect/PortfolioSelect";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { useGetContractIdData } from "providers/ContractIdProvider";

export const TOTAL_INVESTMENTS_OPTION_ID = 0;

/**
 * Whether portfolioToCheck is sub of any of portfolios.
 * @param portfolios portfolios of which portfolioToCheck is potentially a sub
 * @param portfolioToCheck portfolio to check if sub of others
 * @returns if portfolioToCheck is sub of portfolios
 */
const isSubPortfolio = (
  portfolios: Portfolio[] | undefined,
  portfolioToCheck: Portfolio
) => {
  return portfolios?.some((portfolio) => {
    if (!portfolio.portfolios?.length) return false;
    for (const subPortfolio of portfolio.portfolios) {
      if (subPortfolio.id === portfolioToCheck.id) return true;
      const isSubOfSubs = isSubPortfolio(
        subPortfolio.portfolios,
        portfolioToCheck
      );
      if (isSubOfSubs) return true;
    }
    return false;
  });
};

export const useGetPortfolioOptions = (includeTotal = true) => {
  const { t } = useModifiedTranslation();
  const { selectedContactId } = useGetContractIdData();
  const { data: { portfolios } = { portfolios: [] } } = useGetContactInfo(
    false,
    selectedContactId
  );

  //Keep only top level portfolios from FA
  const topLevelPortfolios = portfolios.filter(
    (portfolio) => !isSubPortfolio(portfolios, portfolio)
  );

  const portfolioOptions: PortfolioOption[] = useMemo(() => {
    if (topLevelPortfolios.length === 1) {
      const portfolio = topLevelPortfolios[0];
      return [getPortfolioOption(portfolio)];
    }
    const predefinedOptions =
      includeTotal && topLevelPortfolios.length !== 0
        ? [
            {
              id: TOTAL_INVESTMENTS_OPTION_ID,
              urlPrefix: "",
              label: t("navTab.totalInvestments"),
              subOptions: [],
              details: undefined,
            },
          ]
        : [];

    return [
      ...predefinedOptions,
      ...topLevelPortfolios.map((portfolio) => getPortfolioOption(portfolio)),
    ];
  }, [topLevelPortfolios, t, includeTotal]);

  return portfolioOptions;
};

/**
 * Returns the portfolio option for the given portfolio,
 * including its sub-options (if they don't have PortfolioGroups.HIDE).
 * @param {Portfolio} portfolio - The portfolio to create the portfolio option for.
 * @param {Boolean} includeSubPortfolios - Whether to include sub portfolios.
 * @returns {PortfolioOption} The portfolio option for the given portfolio.
 */
export const getPortfolioOption = (
  portfolio: Portfolio
): PortfolioOption & { details?: Portfolio } => {
  const portfolioOption = {
    id: portfolio.id,
    urlPrefix: `/portfolio/${portfolio.id}`,
    label: portfolio.name,
    details: portfolio,
    //only creates an option for sub portfolios that do not have PortfolioGroup.HIDE
    subOptions: portfolio?.portfolios?.reduce((prev, currSub) => {
      const hide = currSub.portfolioGroups?.some(
        (grp) => grp.code === PortfolioGroups.HIDE
      );
      if (!hide) {
        const subOptionProps = getPortfolioOption(currSub);
        prev.push(subOptionProps);
      }
      return prev;
    }, [] as (PortfolioOption & { details?: Portfolio })[]),
  };
  return portfolioOption;
};
