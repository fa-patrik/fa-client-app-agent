import { gql, useQuery } from "@apollo/client";
import { useGetContractIdData } from "providers/ContractIdProvider";

export interface CalculatedAllowance {
	calcDate?: string | null;
	remainingAllowance: number;
	usedAllowance: number;
	taxWrapper?: {
		id?: number | null;
		code?: string | null;
		name?: string | null;
	} | null;
}

interface CalculatedAllowanceResponse {
	contact?: {
		id: number;
		calculatedTaxWrapperAllowances: CalculatedAllowance[];
	};
}

export interface UseGetCalculatedAllowancesParams {
	contactId?: string | number;
	taxWrapperCodes: string[];
	calcDate?: string;
}

const GET_CALCULATED_TAX_WRAPPER_ALLOWANCES = gql`
	query GetCalculatedTaxWrapperAllowances(
		$contactId: Long
		$calculationDetails: [AllowanceCalculationParamsInput]
	) {
		contact(id: $contactId) {
			id
			calculatedTaxWrapperAllowances(
				calculationDetails: $calculationDetails
			) {
				calcDate
				remainingAllowance
				usedAllowance
				taxWrapper { id code name }
			}
		}
	}
`;

export const useGetCalculatedTaxWrapperAllowances = (
	params?: Partial<UseGetCalculatedAllowancesParams>
) => {
	const { selectedContactId } = useGetContractIdData();
	const today = new Date().toISOString().slice(0, 10);
	const contactId = params?.contactId ?? selectedContactId;
	const calcDate = params?.calcDate ?? today;
	const taxWrapperCodes = params?.taxWrapperCodes ?? [];

	const { data, loading, error, refetch } = useQuery<CalculatedAllowanceResponse>(
		GET_CALCULATED_TAX_WRAPPER_ALLOWANCES,
		{
			variables: {
				contactId: contactId?.toString(),
				calculationDetails: taxWrapperCodes.map((code) => ({
					calcDate,
					taxWrapperCode: code,
				})),
			},
			fetchPolicy: "cache-and-network",
			skip: !contactId || taxWrapperCodes.length === 0,
		}
	);

	const allowances = data?.contact?.calculatedTaxWrapperAllowances ?? [];
	return { data: allowances, loading, error, refetch };
};

export const isIsaWrapper = (a: CalculatedAllowance) => {
	const name = a.taxWrapper?.name?.toLowerCase() || "";
	const code = a.taxWrapper?.code?.toLowerCase() || "";
	return name.includes("isa") || code.includes("isa");
};

export interface IsaGroupTotals {
	totalAllowance: number;
	usedAllowance: number;
	remainingAllowance: number;
}

export const computeIsaGroupTotals = (
	isaAllowances: CalculatedAllowance[]
): IsaGroupTotals | undefined => {
	if (!isaAllowances?.length) return undefined;
	const first = isaAllowances[0];
	const total = Math.max(0, (first.usedAllowance ?? 0) + (first.remainingAllowance ?? 0));
	const used = Math.max(0, isaAllowances.reduce((acc, cur) => Math.max(acc, cur.usedAllowance ?? 0), 0));
	const remaining = Math.max(
		0,
		isaAllowances.reduce((acc, cur) => Math.min(acc, cur.remainingAllowance ?? 0), first.remainingAllowance ?? 0)
	);
	return { totalAllowance: total, usedAllowance: used, remainingAllowance: remaining };
};