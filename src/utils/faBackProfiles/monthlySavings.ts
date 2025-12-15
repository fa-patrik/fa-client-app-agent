import type { Portfolio } from "api/common/useGetContactInfo";
import type {
  Attribute,
  Profile,
} from "api/common/useGetPortfoliosWithProfileAndFigures";
import type { PortfolioOption } from "components/PortfolioSelect/PortfolioSelect";
import { getDefaultValueAsNumber } from "./common";

export enum MonthlySavingsFieldId {
  AMOUNT = "amount",
  DATE = "date",
  ENABLE = "enable",
}

interface PortfolioWithProfile extends Portfolio {
  profile: Profile | null;
}

export interface MonthlySavingsProfile {
  [field: string]: Attribute | undefined;
}

export interface MonthlySavings {
  monthlySavings: MonthlySavingsProfile | undefined;
}

export interface PortfolioWithMonthlySavings extends Portfolio {
  monthlySavings: MonthlySavingsProfile | undefined;
}

export const MONTHLY_SAVINGS_PROFILE_KEY = "monthlysavings";

export const getMonthlySavingsFromProfile = (
  profile: Profile
): MonthlySavingsProfile => {
  return profile.attributes.reduce((prev, curr) => {
    //split the attributeKey into its constituents
    //for example "portfolio.monthlysavings.amount" =>
    //["portfolio","monthlysavings","amount"]
    const [, profileKey, field] = curr.attributeKey.split(".");
    //add field to map
    if (profileKey?.toLowerCase() === MONTHLY_SAVINGS_PROFILE_KEY) {
      prev[field] = curr;
    }
    return prev;
  }, {} as MonthlySavingsProfile);
};

/**
 * Adds a monthlySavings property to each portfolio
 * containing the key-value pairs of the fields related
 * to the FA Back monthly savings profile.
 * @param portfolios portfolios with Profile
 * @param removePfWithIncompleteProfiles the result array will not contain portfolios with invalid profiles (incomplete data)
 */
export function addMonthlySavingsToPortfolios<T extends PortfolioWithProfile>(
  portfolios: T[],
  removePfWithIncompleteProfiles = true
): Array<T & MonthlySavings> {
  return portfolios.reduce<Array<T & MonthlySavings>>((prev, currPortfolio) => {
    const monthlySavingsProfile = currPortfolio.profile
      ? getMonthlySavingsFromProfile(currPortfolio.profile)
      : undefined;

    const portfolioWithProfile = {
      ...currPortfolio,
      monthlySavings: monthlySavingsProfile,
      portfolios: currPortfolio.portfolios
        ? addMonthlySavingsToPortfolios(
            currPortfolio.portfolios as PortfolioWithProfile[],
            removePfWithIncompleteProfiles
          )
        : [],
    } as T & MonthlySavings;

    if (removePfWithIncompleteProfiles) {
      if (
        monthlySavingsProfile &&
        isValidMonthlySavingsProfile(monthlySavingsProfile)
      ) {
        prev.push(portfolioWithProfile);
      }
    } else {
      prev.push(portfolioWithProfile);
    }

    return prev;
  }, []);
}

/**
 *
 * @returns true if there is at least one monthly savings
 * profile that has complete and relevant data.
 */
export const getHasMonthlySavings = (
  portfolios: PortfolioWithMonthlySavings[] | undefined
) => {
  if (portfolios) {
    for (const portfolio of portfolios) {
      if (
        portfolio.monthlySavings &&
        isValidMonthlySavingsProfile(portfolio.monthlySavings)
      )
        return true;
    }
  }
  return false;
};

/**
 * @returns true if the profile is valid, ie. it has complete
 * and relevant data.
 */
export const isValidMonthlySavingsProfile = (
  profile: MonthlySavingsProfile
) => {
  const enabled = profile?.[MonthlySavingsFieldId.ENABLE]?.booleanValue;
  if (!enabled) return false;
  const amount = getDefaultValueAsNumber(
    profile?.[MonthlySavingsFieldId.AMOUNT]?.defaultValue
  );
  const date = getDefaultValueAsNumber(
    profile?.[MonthlySavingsFieldId.DATE]?.defaultValue
  );
  const profileIsComplete =
    amount && amount > 0 && !!date && getSelectedMonths(profile).length > 0
      ? true
      : false;
  if (profileIsComplete) return true;
  return false;
};

export const getSelectedMonthsAsMap = (
  profile: MonthlySavingsProfile | undefined
) => {
  const selectedMonths = {} as Record<number, boolean>;
  if (profile) {
    for (let month = 1; month <= 12; month++) {
      const isMonthSelected = profile[month]?.booleanValue;
      if (isMonthSelected) {
        selectedMonths[month] = true;
      } else {
        selectedMonths[month] = false;
      }
    }
  }
  return selectedMonths;
};

export const getSelectedMonths = (
  profile: MonthlySavingsProfile | undefined
) => {
  const selectedMonths = [];
  if (profile) {
    for (let month = 1; month <= 12; month++) {
      const isMonthSelected = profile[month]?.booleanValue;
      if (isMonthSelected) selectedMonths.push(month);
    }
  }
  return selectedMonths;
};

export const isPortfolioInMonthlySavings = (
  portfolioOption: PortfolioOption,
  portfoliosWithMonthlySavings: PortfolioWithMonthlySavings[]
): boolean => {
  if (portfoliosWithMonthlySavings?.some((p) => p.id === portfolioOption.id)) {
    return true;
  }
  if (portfolioOption?.subOptions) {
    return portfolioOption?.subOptions?.some((subOption) =>
      isPortfolioInMonthlySavings(subOption, portfoliosWithMonthlySavings)
    );
  }
  return false;
};
