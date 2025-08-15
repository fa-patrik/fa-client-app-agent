/* eslint-disable import/order */
import { useMemo } from "react";
import { useGetCalculatedTaxWrapperAllowances, computeIsaGroupTotals, isIsaWrapper, CalculatedAllowance } from "api/taxWrappers/useGetCalculatedTaxWrapperAllowances";
import { Card, LabeledDiv, QueryLoadingWrapper } from "components";
import Banner from "components/Banner/Banner";
import { Severity } from "components/Alert/Alert";
import { useGetContactInfo } from "api/common/useGetContactInfo";
import { useGetContractIdData } from "providers/ContractIdProvider";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";

function startOfDay(d: Date) {
	return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function getUkTaxYearEnd(reference: Date) {
	// UK tax year ends on 5 April
	const year =
		reference.getMonth() > 3 ||
		(reference.getMonth() === 3 && reference.getDate() >= 6)
			? reference.getFullYear() + 1
			: reference.getFullYear();
	return new Date(year, 3, 5);
}

function getUkTaxYearLabel(reference: Date) {
	// Tax year runs 6 April to 5 April
	const startYear =
		reference.getMonth() > 3 ||
		(reference.getMonth() === 3 && reference.getDate() >= 6)
			? reference.getFullYear()
			: reference.getFullYear() - 1;
	return `${startYear}/${startYear + 1}`;
}

function isMilestone(daysRemaining: number) {
	const targets = [183, 92, 30];
	return targets.some((t) => Math.abs(daysRemaining - t) <= 1 || (t === 30 && daysRemaining <= 30));
}

export const TaxesView = () => {
	const { t } = useModifiedTranslation();
	const { selectedContactId } = useGetContractIdData();
	const { data: { portfolios = [] } = { portfolios: [] } } = useGetContactInfo(false, selectedContactId);
	const topLevelShortNames = useMemo(
		() => portfolios.map((p) => p.shortName).filter(Boolean) as string[],
		[portfolios]
	);

	const allowancesQuery = useGetCalculatedTaxWrapperAllowances({ taxWrapperCodes: topLevelShortNames });

	const isaAllowances = useMemo(
		() => (allowancesQuery.data ?? []).filter(isIsaWrapper),
		[allowancesQuery.data]
	);

	const isaTotals = useMemo(() => computeIsaGroupTotals(isaAllowances), [isaAllowances]);

	const today = new Date();
	const taxYearEnd = getUkTaxYearEnd(today);
	const daysRemaining = Math.max(0, Math.ceil((taxYearEnd.getTime() - startOfDay(today).getTime()) / (24 * 60 * 60 * 1000)));
	const showBanner = (isaTotals?.remainingAllowance ?? 0) > 0 && isMilestone(daysRemaining);
	const taxYearLabel = getUkTaxYearLabel(today);

	return (
		<QueryLoadingWrapper
			loading={allowancesQuery.loading}
			error={allowancesQuery.error}
			data={{ ok: true }}
			SuccessComponent={() => (
				<div className="grid grid-cols-1 gap-4">
					{showBanner && (
						<Banner
							id="isa-allowance-reminder"
							severity={Severity.Info}
							title={t("taxesPage.bannerTitle", {
								defaultValue:
									"You have {{days}} days remaining to use your allowance for the tax year {{taxYearLabel}}.",
								days: daysRemaining,
								taxYearLabel,
							})}
							dismissable
						/>
					)}
					<Card header={t("taxesPage.isaGroupHeader", { defaultValue: "ISA allowance" })}>
						<div className="grid grid-cols-3 gap-4">
							<LabeledDiv label={t("taxesPage.totalAllowance", { defaultValue: "Total allowance" })} className="text-xl font-semibold">
								{t("numberWithCurrency", { value: isaTotals?.totalAllowance ?? 0, currency: portfolios?.[0]?.currency?.securityCode })}
							</LabeledDiv>
							<LabeledDiv label={t("taxesPage.used", { defaultValue: "Used" })} className="text-xl font-semibold">
								{t("numberWithCurrency", { value: isaTotals?.usedAllowance ?? 0, currency: portfolios?.[0]?.currency?.securityCode })}
							</LabeledDiv>
							<LabeledDiv label={t("taxesPage.remaining", { defaultValue: "Remaining" })} className="text-xl font-semibold">
								{t("numberWithCurrency", { value: isaTotals?.remainingAllowance ?? 0, currency: portfolios?.[0]?.currency?.securityCode })}
							</LabeledDiv>
						</div>
					</Card>

					<Card header={t("taxesPage.perWrapperHeader", { defaultValue: "By ISA type / portfolio" })}>
						<div className="grid gap-3">
							{/* eslint-disable-next-line tailwindcss/classnames-order */}
							{isaAllowances.map((a: CalculatedAllowance) => (
								<div key={`${a.taxWrapper?.code}`} className="grid items-center grid-cols-4 p-2 border rounded-lg">
									<div className="col-span-2 font-medium">{a.taxWrapper?.name ?? a.taxWrapper?.code}</div>
									<div className="text-right">
										{t("numberWithCurrency", { value: a.usedAllowance ?? 0, currency: portfolios?.[0]?.currency?.securityCode })}
									</div>
									<div className="text-right">
										{t("numberWithCurrency", { value: a.remainingAllowance ?? 0, currency: portfolios?.[0]?.currency?.securityCode })}
									</div>
								</div>
							))}
							{!isaAllowances.length && (
								<div className="text-sm text-gray-600">{t("messages.noDataAvailable")}</div>
							)}
						</div>
					</Card>
				</div>
			)}
		/>
	);
};