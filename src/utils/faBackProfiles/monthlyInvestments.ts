import {
  Attribute,
  Profile,
} from "api/generic/useGetPortfoliosWithProfileAndFigures";
import { Portfolio } from "api/initial/useGetContactInfo";
import { getDefaultValueAsNumber } from "./general";

export enum MonthlyInvestmentsFieldId {
  ENABLE = "enable",
  SECURITY = "security",
  AMOUNT = "amount",
  DATE = "date",
}

interface PortfolioWithProfile extends Portfolio {
  profile: Profile | null;
}

export interface MonthlyInvestmentsProfile {
  fields: {
    [field: string]: Attribute | undefined;
  };
  rows: {
    [row: string]: {
      [field: string]: Attribute | undefined;
    };
  };
}

export interface MonthlyInvestments {
  monthlyInvestments: MonthlyInvestmentsProfile | undefined;
}

export interface PortfolioWithMonthlyInvestments extends Portfolio {
  monthlyInvestments: MonthlyInvestmentsProfile | undefined;
}

const MONTHLY_INVESTMENT_PROFILE_KEY = "monthlyinvestments";

export const getMonthlyInvestmentsFromProfile = (
  profile: Profile
): MonthlyInvestmentsProfile => {
  const monthlyInvestmentsProfile = profile.attributes.reduce(
    (prev, curr) => {
      //split the attributeKey into its constituents
      if (curr.attributeKey.split(".").length === 4) {
        const [, profileKey, row, field] = curr.attributeKey.split(".");
        if (profileKey?.toLowerCase() === MONTHLY_INVESTMENT_PROFILE_KEY) {
          if (!prev.rows[row]) {
            prev.rows[row] = {};
          }
          prev.rows[row][field] = curr;
        }
      }
      if (curr.attributeKey.split(".").length === 3) {
        const [, profileKey, field] = curr.attributeKey.split(".");
        if (profileKey?.toLowerCase() === MONTHLY_INVESTMENT_PROFILE_KEY) {
          prev.fields[field] = curr;
        }
      }
      return prev;
    },
    { rows: {}, fields: {} } as MonthlyInvestmentsProfile
  );

  return monthlyInvestmentsProfile;
};

/**
 * Adds a monthlyInvestments property to each portfolio
 * containing the key-value pairs of the fields related
 * to the FA Back monthly investments profile.
 * @param portfolios portfolios with Profile
 * @param removePfWithIncompleteProfiles the result array will not contain portfolios with invalid profiles (incomplete data)
 */
export function addMonthlyInvestmentsToPortfolios<
  T extends PortfolioWithProfile
>(
  portfolios: T[],
  removePfWithIncompleteProfiles = true
): Array<T & MonthlyInvestments> {
  return portfolios.reduce<Array<T & MonthlyInvestments>>(
    (prev, currPortfolio) => {
      const monthlyInvestmentsProfile = currPortfolio.profile
        ? getMonthlyInvestmentsFromProfile(currPortfolio.profile)
        : undefined;

      const portfolioWithProfile = {
        ...currPortfolio,
        monthlyInvestments: monthlyInvestmentsProfile,
      } as T & MonthlyInvestments;

      if (removePfWithIncompleteProfiles) {
        if (
          monthlyInvestmentsProfile &&
          isValidMonthlySavingsProfile(monthlyInvestmentsProfile)
        ) {
          prev.push(portfolioWithProfile);
        }
      } else {
        prev.push(portfolioWithProfile);
      }
      return prev;
    },
    []
  );
}

/**
 *
 * @returns true if there is at least one monthly investments
 * profile that has complete and relevant data.
 */
export const getHasMonthlyInvestments = (
  portfolios: PortfolioWithMonthlyInvestments[] | undefined
) => {
  if (portfolios) {
    for (const portfolio of portfolios) {
      if (
        portfolio.monthlyInvestments &&
        isValidMonthlySavingsProfile(portfolio.monthlyInvestments)
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
  profile: MonthlyInvestmentsProfile
) => {
  const enabled =
    profile?.fields?.[MonthlyInvestmentsFieldId.ENABLE]?.booleanValue;
  if (!enabled) return false;
  for (const [row, rowFields] of Object.entries(profile.rows)) {
    const amount = getDefaultValueAsNumber(
      rowFields?.[MonthlyInvestmentsFieldId.AMOUNT]?.defaultValue
    );
    const date = getDefaultValueAsNumber(
      rowFields?.[MonthlyInvestmentsFieldId.DATE]?.defaultValue
    );
    const profileIsComplete =
      amount &&
      amount > 0 &&
      !!date &&
      getSelectedMonths(profile.rows[row]).length > 0
        ? true
        : false;
    if (profileIsComplete) return true;
  }
  return false;
};

export const getSelectedMonthsAsMap = (
  profile: MonthlyInvestmentsProfile["rows"]["row"] | undefined
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
  profile: MonthlyInvestmentsProfile["rows"]["row"] | undefined
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

export const getUniqueSecurityCodes = (
  portfolios: (Portfolio & MonthlyInvestments)[]
) => {
  const securityCodes: string[] = [];
  for (const portfolio of portfolios) {
    const monthlyInvestmentRows = portfolio.monthlyInvestments?.rows
      ? Object.values(portfolio.monthlyInvestments?.rows)
      : undefined;
    if (monthlyInvestmentRows) {
      for (const row of monthlyInvestmentRows) {
        const securityCode =
          row?.[MonthlyInvestmentsFieldId.SECURITY]?.stringValue;
        if (securityCode) securityCodes.push(securityCode);
      }
    }
  }
  const uniqueSecurityCodes = new Set<string>(securityCodes);
  return uniqueSecurityCodes;
};
