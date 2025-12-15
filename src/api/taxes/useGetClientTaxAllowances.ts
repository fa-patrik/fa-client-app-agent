import { useMemo } from "react";
import { gql, useQuery } from "@apollo/client";
import { StandardSolutionTaxWrapper } from "api/enums";
import { getFetchPolicyOptions } from "api/utils";
import type {
  PortfolioType,
  TaxWrapperChild,
  CalculatedTaxWrapperAllowance,
} from "./types";

// GraphQL Query
const GET_CLIENT_TAX_ALLOWANCES_QUERY = gql`
  query GetClientTaxAllowances(
    $contactId: String!
    $calculationDetails: [AllowanceCalculationParamsInput!]!
  ) {
    contactsByParameters(parameters: { contactId: $contactId }) {
      id
      name
      calculatedTaxWrapperAllowances(calculationDetails: $calculationDetails) {
        taxWrapper {
          id
          code
          name
          currency {
            id
            securityCode
            amountDecimalCount
          }
          portfolioTypes {
            id
            code
          }
          children {
            code
          }
        }
        calcDate
        usedAllowance
        remainingAllowance
      }
    }
  }
`;

// Types
export interface TaxWrapperCalculationDetail {
  taxWrapperCode: string;
  calcDate: string;
}

export interface ContactWithAllowances {
  id: string;
  name: string;
  calculatedTaxWrapperAllowances: CalculatedTaxWrapperAllowance[];
}

export interface GetClientTaxAllowancesData {
  contactsByParameters: ContactWithAllowances[];
}

// Transformed data types for the UI (matching existing TaxesView expectations)
export interface ClientTaxAllowance {
  taxWrapperCode: string;
  taxWrapperId: string;
  taxWrapperName: string;
  calcDate: string;
  usedAllowance: number;
  remainingAllowance: number;
  totalAllowance: number;
  utilizationPercentage: number;
  children: TaxWrapperChild[];
  portfolioTypes: PortfolioType[];
}

export interface ClientTaxAllowancesResult {
  contact: {
    id: string;
    name: string;
  } | null;
  isaAllowance: ClientTaxAllowance | null;
  childAllowances: ClientTaxAllowance[];
  summary: {
    totalAllowanceAcrossAllWrappers: number;
    totalUsedAcrossAllWrappers: number;
    totalRemainingAcrossAllWrappers: number;
    currency: string;
    calculationDate: string;
  } | null;
  hasUserTaxConfig: boolean; // Flag indicating if user has tax allowance configuration
}

// Hook parameters
export interface UseGetClientTaxAllowancesParams {
  contactId: string;
  calculationDetails: TaxWrapperCalculationDetail[];
  skip?: boolean;
}

// Data transformation
export const transformClientTaxAllowances = (
  data: GetClientTaxAllowancesData | undefined
): ClientTaxAllowancesResult => {
  if (!data?.contactsByParameters?.length) {
    return {
      contact: null,
      isaAllowance: null,
      childAllowances: [],
      summary: null,
      hasUserTaxConfig: false,
    };
  }

  const contact = data.contactsByParameters[0];
  const allowances = contact.calculatedTaxWrapperAllowances;

  // Check if user has tax configuration - if calculatedTaxWrapperAllowances array exists and contains data
  // If all values are null, then we assume user has no tax config
  const hasUserTaxConfig =
    Array.isArray(allowances) &&
    allowances.length > 0 &&
    allowances.some((allowance) => allowance !== null);

  // Find ISA allowance (parent) - this contains aggregated values
  const isaAllowanceData = allowances.find(
    (allowance) =>
      allowance?.taxWrapper?.code ===
      StandardSolutionTaxWrapper.IndividualSavingsAccount
  );

  // Find child allowances - these are the children of ISA (CISA, SSISA, etc.)
  // We need to filter based on the ISA's children, not just exclude ISA
  const isaChildren =
    isaAllowanceData?.taxWrapper.children?.map((child) => child.code) || [];
  const childAllowancesData = allowances.filter(
    (allowance) =>
      allowance?.taxWrapper?.code &&
      isaChildren.includes(allowance.taxWrapper.code)
  );

  // Transform ISA allowance
  const isaAllowance: ClientTaxAllowance | null = isaAllowanceData
    ? {
        taxWrapperCode: isaAllowanceData.taxWrapper.code,
        taxWrapperId: isaAllowanceData.taxWrapper.id,
        taxWrapperName: isaAllowanceData.taxWrapper.name,
        calcDate: isaAllowanceData.calcDate,
        usedAllowance: isaAllowanceData.usedAllowance,
        remainingAllowance: isaAllowanceData.remainingAllowance,
        totalAllowance:
          isaAllowanceData.usedAllowance + isaAllowanceData.remainingAllowance,
        utilizationPercentage:
          isaAllowanceData.usedAllowance + isaAllowanceData.remainingAllowance >
          0
            ? (isaAllowanceData.usedAllowance /
                (isaAllowanceData.usedAllowance +
                  isaAllowanceData.remainingAllowance)) *
              100
            : 0,
        children: isaAllowanceData.taxWrapper.children || [],
        portfolioTypes: isaAllowanceData.taxWrapper.portfolioTypes || [],
      }
    : null;

  // Transform child allowances
  const childAllowances: ClientTaxAllowance[] = childAllowancesData
    .filter((allowance) => allowance?.taxWrapper) // Extra safety filter
    .map((allowance) => ({
      taxWrapperCode: allowance.taxWrapper.code,
      taxWrapperId: allowance.taxWrapper.id,
      taxWrapperName: allowance.taxWrapper.name || allowance.taxWrapper.code,
      calcDate: allowance.calcDate,
      usedAllowance: allowance.usedAllowance,
      remainingAllowance: allowance.remainingAllowance,
      totalAllowance: allowance.usedAllowance + allowance.remainingAllowance,
      utilizationPercentage:
        allowance.usedAllowance + allowance.remainingAllowance > 0
          ? (allowance.usedAllowance /
              (allowance.usedAllowance + allowance.remainingAllowance)) *
            100
          : 0,
      children: allowance.taxWrapper.children || [],
      portfolioTypes: allowance.taxWrapper.portfolioTypes || [],
    }));

  // Create summary based on ISA allowance (matching TaxAllowancePieChart expectations)
  const summary = isaAllowance
    ? {
        totalAllowanceAcrossAllWrappers: isaAllowance.totalAllowance,
        totalUsedAcrossAllWrappers: isaAllowance.usedAllowance,
        totalRemainingAcrossAllWrappers: isaAllowance.remainingAllowance,
        currency: isaAllowanceData?.taxWrapper.currency?.securityCode || "",
        calculationDate: isaAllowance.calcDate,
      }
    : null;

  return {
    contact: {
      id: contact.id,
      name: contact.name,
    },
    isaAllowance,
    childAllowances,
    summary,
    hasUserTaxConfig,
  };
};

// Main Hook
export const useGetClientTaxAllowances = ({
  contactId,
  calculationDetails,
  skip = false,
}: UseGetClientTaxAllowancesParams) => {
  const variables = {
    contactId,
    calculationDetails,
  };

  const {
    loading,
    error,
    data: rawData,
  } = useQuery<GetClientTaxAllowancesData>(GET_CLIENT_TAX_ALLOWANCES_QUERY, {
    variables,
    skip: skip || !contactId || !calculationDetails.length,
    ...getFetchPolicyOptions(
      `GetClientTaxAllowances.${contactId}.${calculationDetails.map((d) => `${d.taxWrapperCode}-${d.calcDate}`).join(".")}`
    ),
  });

  // Transform data
  const transformedData = useMemo(() => {
    return transformClientTaxAllowances(rawData);
  }, [rawData]);

  // Return early state if skipped or missing required params
  if (skip || !contactId || !calculationDetails.length) {
    return {
      loading: false,
      error: undefined,
      data: {
        contact: null,
        isaAllowance: null,
        childAllowances: [],
        summary: null,
        hasUserTaxConfig: false,
      },
    };
  }

  return {
    loading,
    error,
    data: transformedData,
  };
};
