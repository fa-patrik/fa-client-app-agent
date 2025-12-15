import type { Portfolio } from "api/common/useGetContactInfo";
import type {
  Attribute,
  Profile,
} from "api/common/useGetPortfoliosWithProfileAndFigures";
import type { TradableSecurity } from "api/trading/useGetTradebleSecurities";
import type { PortfolioMonthlyInvestmentsDTOInput } from "api/trading/useSetMonthlyInvestments";
import type { PortfolioOption } from "components/PortfolioSelect/PortfolioSelect";
import { getPortfolioOption } from "hooks/useGetPortfolioOptions";
import { round } from "utils/number";
import type { MonthlyInvestmentsWizardState } from "wizards/monthlyInvestments/types";
import { getDefaultValueAsNumber } from "./common";

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
const ENABLE_IN_PF_CURRENCY = true;

/**
 * Parses a profile and extracts all fields related
 * to monthly investments into a map-like structure.
 * @returns a map {rows: {}, fields: {}}. Fields are regular fields
 * and rows are security-specific fields of the monthly investments profile.
 */
export const getMonthlyInvestmentsFromProfile = (
  profile: Profile
): MonthlyInvestmentsProfile => {
  const PROFILE_KEY_SPLIT_LENGTH = 4;
  const FIELD_KEY_SPLIT_LENGTH = 3;
  return profile.attributes.reduce<MonthlyInvestmentsProfile>(
    (prev, curr) => {
      const splittedAttributeKey = curr.attributeKey.split(".");
      //split the attributeKey into its constituents
      if (splittedAttributeKey.length === PROFILE_KEY_SPLIT_LENGTH) {
        const [, profileKey, row, field] = splittedAttributeKey;
        if (profileKey.toLowerCase() === MONTHLY_INVESTMENT_PROFILE_KEY) {
          prev.rows[row] = prev.rows[row] || {};
          prev.rows[row][field] = curr;
        }
      }
      if (splittedAttributeKey.length === FIELD_KEY_SPLIT_LENGTH) {
        const [, profileKey, field] = splittedAttributeKey;
        if (profileKey.toLowerCase() === MONTHLY_INVESTMENT_PROFILE_KEY) {
          prev.fields[field] = curr;
        }
      }
      return prev;
    },
    { rows: {}, fields: {} }
  );
};

/**
 * Parses the Profile of each portfolio and
 * extracts all fields related to the monthly investments profile
 * into a map-like structure, that is easier to work with. Then
 * adds the map structure to the portfolio as a property
 * 'monthlyInvestments'.
 * @param portfolios portfolios with Profile
 * @param removePfWithIncompleteProfiles the result array will not contain portfolios with invalid profiles (incomplete data)
 */
export function addMonthlyInvestmentsToPortfolios<
  T extends PortfolioWithProfile,
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
        portfolios: currPortfolio.portfolios
          ? addMonthlyInvestmentsToPortfolios(
              currPortfolio.portfolios as PortfolioWithProfile[],
              removePfWithIncompleteProfiles
            )
          : [],
      } as T & MonthlyInvestments;

      if (removePfWithIncompleteProfiles) {
        if (
          monthlyInvestmentsProfile &&
          isValidMonthlyInvestmentsProfile(monthlyInvestmentsProfile)
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
 * Monthly investments profiles are not enforced to have
 * relevant nor type safe values. This function checks
 * whether a monthly investments profile has relevant
 * data.
 */
export const isValidMonthlyInvestmentsProfile = (
  profile: MonthlyInvestmentsProfile
) => {
  const enabled =
    profile?.fields?.[MonthlyInvestmentsFieldId.ENABLE]?.booleanValue;
  if (!enabled) return false;
  for (const [, rowFields] of Object.entries(profile.rows)) {
    const amount = getDefaultValueAsNumber(
      rowFields?.[MonthlyInvestmentsFieldId.AMOUNT]?.defaultValue
    );
    const date = getDefaultValueAsNumber(
      rowFields?.[MonthlyInvestmentsFieldId.DATE]?.defaultValue
    );
    const profileIsComplete =
      amount && amount > 0 && !!date && getSelectedMonths(profile).length > 0
        ? true
        : false;
    if (profileIsComplete) return true;
  }
  return false;
};

/**
 * Gets the selected months (1-12) of a monthly investments profile. Each security can
 * have its own selected months. This function makes the
 * assumption that all securities share the same selection.
 * This is because the monthly investments wizard
 * does not display selected months per security, nor
 * supports setting it per security.
 */
export const getSelectedMonthsAsMap = (
  profile: MonthlyInvestmentsProfile | undefined
) => {
  const selectedMonths = {} as Record<number, boolean>;
  if (profile) {
    const securityRow = profile.rows[1];
    for (let month = 1; month <= 12; month++) {
      const isMonthSelected = securityRow[month]?.booleanValue;
      if (isMonthSelected) {
        selectedMonths[month] = true;
      } else {
        selectedMonths[month] = false;
      }
    }
  }
  return selectedMonths;
};

/**
 * Gets the selected months (1-12) of a monthly investments profile. Each security can
 * have its own selected months. This function makes the
 * assumption that all securities share the same selection.
 * This is because the monthly investments wizard
 * does not display selected months per security, nor
 * supports setting it per security.
 */
export const getSelectedMonths = (
  profile: MonthlyInvestmentsProfile | undefined
) => {
  const selectedMonths = [];
  if (profile) {
    const securityRow = profile.rows[1];
    //all securities are expected to have the same months selected
    for (let month = 1; month <= 12; month++) {
      const isMonthSelected = securityRow[month]?.booleanValue;
      if (isMonthSelected) selectedMonths.push(month);
    }
  }
  return selectedMonths;
};

/**
 * Gets the investment date of a monthly investments profile. Each security can
 * have its own investment date. This function makes the
 * assumption that all securities share the same date.
 * This is because the monthly investments wizard
 * does not display selected date per security, nor
 * supports setting it per security.
 */
export const getSelectedDate = (
  profile: MonthlyInvestmentsProfile | undefined
) => {
  const selectedDate =
    profile?.rows[1]?.[MonthlyInvestmentsFieldId.DATE]?.intValue;
  return selectedDate?.toString();
};

/**
 * Gets the unique security codes from multiple
 * portfolios' monthly investments profiles.
 * Useful if you need to deduct which securities
 * to fetch when viewing the details of multiple
 * investment plans at once.
 */
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

/**
 * Gets the amount and percentage distribution
 * of securities in a monthly investments profile.
 */
export const getDistribution = (
  monthlyInvestments: MonthlyInvestmentsProfile,
  securities: Record<TradableSecurity["securityCode"], TradableSecurity>,
  amountDecimalCount: number
) => {
  const totalAmountToInvest = getAmountToInvest(monthlyInvestments);

  const securityRows = monthlyInvestments?.rows;
  const amountDistribution: Record<string, number> = {};
  const percentageDistribution: Record<string, number> = {};

  if (securityRows) {
    for (const row of Object.values(monthlyInvestments.rows)) {
      const securityCode =
        row?.[MonthlyInvestmentsFieldId.SECURITY]?.stringValue;
      if (securityCode) {
        const securityId = securities[securityCode].id;
        const rowAmount =
          getDefaultValueAsNumber(
            row?.[MonthlyInvestmentsFieldId.AMOUNT]?.defaultValue
          ) || 0;

        if (!(securityId in amountDistribution)) {
          amountDistribution[securityId] = 0;
        }
        amountDistribution[securityId] += rowAmount;
        percentageDistribution[securityId] = round(
          (amountDistribution[securityId] / (totalAmountToInvest || 1)) * 100,
          amountDecimalCount
        );
      }
    }
  }
  return {
    amountDistribution,
    percentageDistribution,
  };
};

/**
 * Converts the monthly investments wizard data state format
 * into the format required by the importPortfolioMonthlyInvestments api.
 */
export const convertWizardStateToApiFormat = (
  wizardData: MonthlyInvestmentsWizardState
): PortfolioMonthlyInvestmentsDTOInput => {
  const portfolioShortName =
    wizardData.selectedPortfolioOption?.details?.shortName || "";
  const selectedMonthsMap = wizardData.selectedMonths;
  const selectedDate = wizardData.selectedDate;
  const selectedSecurities = wizardData.selectedSecurities;
  const amountDistribution = wizardData.amountDistribution;
  const dtoInput: PortfolioMonthlyInvestmentsDTOInput = {
    portfolio: portfolioShortName,
    enableInPfCurrency: ENABLE_IN_PF_CURRENCY,
    rows: [],
  };

  const selectedMonths = selectedMonthsMap
    ? Object.keys(selectedMonthsMap).reduce((prev, currMonthNr) => {
        if (selectedMonthsMap[currMonthNr]) prev.push(Number(currMonthNr));
        return prev;
      }, [] as number[])
    : [];

  if (selectedSecurities) {
    for (const security of selectedSecurities) {
      dtoInput.rows.push({
        date: Number(selectedDate),
        selectedMonths: selectedMonths,
        security: security.securityCode,
        amount: Number(amountDistribution?.[security.id]),
      });
    }
  }
  return dtoInput;
};

/**
 * Converts the portfolio's monthlyInvestment
 * to the format used by the monthly investments wizard.
 * @param portfolioWithMonthlyInvestments - portfolio with a monthlyInvestments
 * @param securities - security map
 * @returns monthly investments wizard data state
 */
export const convertMonthlyInvestmentsProfileToWizardState = (
  portfolioWithMonthlyInvestments: PortfolioWithMonthlyInvestments,
  securities: Record<TradableSecurity["securityCode"], TradableSecurity>
): MonthlyInvestmentsWizardState | undefined => {
  const monthlyInvestmentsProfile =
    portfolioWithMonthlyInvestments.monthlyInvestments;
  if (
    monthlyInvestmentsProfile &&
    isValidMonthlyInvestmentsProfile(monthlyInvestmentsProfile)
  ) {
    const selectedPortfolioOption: PortfolioOption | undefined =
      getPortfolioOption(portfolioWithMonthlyInvestments);

    const portfolioCurrencyAmountDecimalCount =
      selectedPortfolioOption?.details?.currency?.amountDecimalCount ?? 2;

    //sum up the total amount to invest through all security row amounts
    const amountToInvest = getAmountToInvest(monthlyInvestmentsProfile);

    const { amountDistribution, percentageDistribution } = getDistribution(
      monthlyInvestmentsProfile,
      securities,
      portfolioCurrencyAmountDecimalCount
    );

    const amountDistributionWithStringValues = Object.keys(
      amountDistribution
    ).reduce(
      (prev, curr) => {
        prev[curr] = amountDistribution[curr].toString();
        return prev;
      },
      {} as Record<string, string>
    );

    const percentageDistributionWithStringValues = Object.keys(
      percentageDistribution
    ).reduce(
      (prev, curr) => {
        prev[curr] = percentageDistribution[curr].toString();
        return prev;
      },
      {} as Record<string, string>
    );

    const securityCodes = getUniqueSecurityCodes([
      portfolioWithMonthlyInvestments,
    ]);
    const selectedSecurities = Array.from(securityCodes).reduce(
      (prev, securityCode) => {
        if (securityCode in securities) {
          prev.push(securities[securityCode]);
        }
        return prev;
      },
      [] as TradableSecurity[]
    );
    const selectedDate = getSelectedDate(monthlyInvestmentsProfile);
    const selectedMonths = getSelectedMonthsAsMap(monthlyInvestmentsProfile);

    const wizardState: MonthlyInvestmentsWizardState = {
      isEditing: false,
      selectedPortfolioOption,
      amountToInvest,
      amountToInvestPrev: amountToInvest,
      amountDistribution: amountDistributionWithStringValues,
      percentageDistribution: percentageDistributionWithStringValues,
      selectedDate,
      selectedMonths,
      selectedSecurities,
    };

    return wizardState;
  }
};

/**
 * Returns a request body that will clear all fields
 * of the profile.
 */
export const getEmptyApiInput = (portfolioShortName: string) => {
  const dtoInput = {
    portfolio: portfolioShortName,
    enableInPfCurrency: ENABLE_IN_PF_CURRENCY,
    rows: [],
  } as PortfolioMonthlyInvestmentsDTOInput;
  return dtoInput;
};

/**
 * @returns the total amount to invest
 * as the sum of  each underlying security row's
 * amount field in the profile.
 */
export const getAmountToInvest = (
  monthlyInvestments: MonthlyInvestmentsProfile
) => {
  const totalAmount = Object.values(monthlyInvestments.rows).reduce(
    (prev, currRow) => {
      const rowAmount =
        getDefaultValueAsNumber(
          currRow[MonthlyInvestmentsFieldId.AMOUNT]?.defaultValue
        ) || 0;
      prev += rowAmount;
      return prev;
    },
    0
  );
  return totalAmount;
};
