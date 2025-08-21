import { useMemo } from "react";
import classNames from "classnames";
import { Card } from "components/Card/Card";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import data from "./mockData.json";

interface WrapperItem {
	name: string;
	limit: number;
	used: number;
}

interface IncomeItem {
	name: string;
	limit: number;
	used: number;
}

interface CapitalGainsItem {
	limit: number;
	used: number;
}

interface BusinessItem {
	name: string;
	limit: number;
	used: number;
}

const getPercentUsed = (used: number, limit: number) => {
	if (!limit || limit <= 0) return 0;
	return Math.min(100, Math.max(0, (used / limit) * 100));
};

const getTrafficColor = (percent: number) => {
	if (percent > 90) return "bg-red-500";
	if (percent >= 70) return "bg-amber-500";
	return "bg-green-500";
};

const getTextTrafficColor = (percent: number) => {
	if (percent > 90) return "text-red-600";
	if (percent >= 70) return "text-amber-600";
	return "text-green-600";
};

const formatCurrency = (value: number) =>
	new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(
		value
	);

const formatPercent = (value: number) => `${value.toFixed(0)}%`;

const SectionHeader = ({ title, subtitle }: { title: string; subtitle?: string }) => (
	<div className="flex items-baseline justify-between gap-2 mb-2">
		<h2 className="text-xl font-semibold">{title}</h2>
		{subtitle && <span className="text-sm text-gray-500">{subtitle}</span>}
	</div>
);

const ProgressBar = ({ used, limit, label }: { used: number; limit: number; label: string }) => {
	const percent = useMemo(() => getPercentUsed(used, limit), [used, limit]);
	const color = getTrafficColor(percent);
	return (
		<div className="flex flex-col gap-1">
			<div className="flex justify-between text-sm">
				<span className="font-medium">{label}</span>
				<span className={classNames("font-medium", getTextTrafficColor(percent))}>{formatPercent(percent)}</span>
			</div>
			<div className="h-3 w-full bg-gray-200 rounded">
				<div className={classNames("h-3 rounded", color)} style={{ width: `${percent}%` }} />
			</div>
			<div className="flex justify-between text-xs text-gray-600">
				<span>
					{formatCurrency(used)} used of {formatCurrency(limit)}
				</span>
				<span>{formatCurrency(Math.max(0, limit - used))} remaining</span>
			</div>
		</div>
	);
};

const AllowanceTable = ({
	title,
	rows,
}: {
	title: string;
	rows: Array<{ name: string; limit: number; used: number }>;
}) => {
	const { t } = useModifiedTranslation();
	return (
		<Card>
			<div className="p-3">
				<SectionHeader title={title} />
				<div className="overflow-x-auto">
					<table className="min-w-full text-left text-sm">
						<thead className="text-gray-600">
							<tr className="border-b">
								<th className="py-2 pr-4">{t("taxesPage.allowance")}</th>
								<th className="py-2 pr-4">{t("taxesPage.limit")}</th>
								<th className="py-2 pr-4">{t("taxesPage.used")}</th>
								<th className="py-2 pr-4">{t("taxesPage.remaining")}</th>
							</tr>
						</thead>
						<tbody>
							{rows.map((r) => {
								const remaining = Math.max(0, r.limit - r.used);
								const percent = getPercentUsed(r.used, r.limit);
								return (
									<tr key={r.name} className="border-b last:border-0">
										<td className="py-2 pr-4">
											<div className="flex items-center gap-2">
												<span>{r.name}</span>
												<span className={classNames("text-xs font-semibold", getTextTrafficColor(percent))}>
													{formatPercent(percent)}
												</span>
											</div>
										</td>
										<td className="py-2 pr-4">{formatCurrency(r.limit)}</td>
										<td className="py-2 pr-4">{formatCurrency(r.used)}</td>
										<td className="py-2 pr-4">{formatCurrency(remaining)}</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			</div>
		</Card>
	);
};

const Accordion = ({ title, children }: { title: string; children: React.ReactNode }) => {
	const id = title.replace(/\s+/g, "-").toLowerCase();
	return (
		<div className="border rounded-md bg-white">
			<input id={id} type="checkbox" className="peer hidden" defaultChecked={false} />
			<label htmlFor={id} className="flex items-center justify-between w-full px-3 py-2 cursor-pointer select-none">
				<span className="font-medium">{title}</span>
				<span className="text-gray-500 transition-transform peer-checked:rotate-180">▾</span>
			</label>
			<div className="px-3 pb-3 hidden peer-checked:block">{children}</div>
		</div>
	);
};

export const TaxesView = () => {
	const wrappers = data.wrappers as WrapperItem[];
	const income = data.income as IncomeItem[];
	const capitalGains = data.capitalGains as CapitalGainsItem;
	const business = data.business as BusinessItem[];

	const capitalPercent = getPercentUsed(capitalGains.used, capitalGains.limit);
	const capitalNearLimit = capitalPercent >= 90;

	const { t } = useModifiedTranslation();
	return (
		<div className="container mx-auto p-2 md:p-4 flex flex-col gap-4">
			<div className="flex items-end justify-between">
				<h1 className="text-2xl font-bold">{t("taxesPage.title")}</h1>
				<span className="text-sm text-gray-500">{t("taxesPage.lastUpdated", { date: "--" })}</span>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<Card>
					<div className="p-3 flex flex-col gap-3">
						<SectionHeader title={t("taxesPage.investmentWrappers")} />
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
							{wrappers.map((w) => (
								<div key={w.name} className="flex flex-col gap-2">
									<ProgressBar label={w.name} used={w.used} limit={w.limit} />
								</div>
							))}
						</div>
					</div>
				</Card>

				<div className="flex flex-col gap-4">
					<Card>
						<div className="p-3">
							<SectionHeader title={t("taxesPage.capitalGains")} />
							<div className="flex flex-col gap-2">
								<ProgressBar label="CGT" used={capitalGains.used} limit={capitalGains.limit} />
								{capitalNearLimit && (
									<div className="text-sm font-semibold text-red-600">{t("taxesPage.nearCgtLimit")}</div>
								)}
							</div>
						</div>
					</Card>

					<Accordion title={t("taxesPage.businessAllowances")}>
						<AllowanceTable title={t("taxesPage.businessAllowances")} rows={business} />
					</Accordion>
				</div>
			</div>

			<AllowanceTable title={t("taxesPage.incomeRelated")} rows={income} />
		</div>
	);
};

export default TaxesView;