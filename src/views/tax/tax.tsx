import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";

type WrapperType = "STOCKS_SHARES_ISA" | "CASH_ISA" | "JUNIOR_ISA" | "OTHER";

interface WrapperAllowanceMock {
  portfolioId?: number;
  portfolioShortName?: string;
  wrapperType: WrapperType;
  allowanceTotalGBP: number;
  usedGBP: number;
  remainingGBP: number;
  portfolioCurrency?: string;
}

interface IsaAllowanceMock {
  taxYearStart: string;
  taxYearEnd: string;
  currency: string; // GBP
  overallAdultIsaAllowanceTotal: number;
  overallAdultIsaUsed: number;
  overallAdultIsaRemaining: number;
  wrappers: WrapperAllowanceMock[];
}

const mockAllowance: IsaAllowanceMock = {
  taxYearStart: "2025-04-06",
  taxYearEnd: "2026-04-05",
  currency: "GBP",
  overallAdultIsaAllowanceTotal: 20000,
  overallAdultIsaUsed: 6500,
  overallAdultIsaRemaining: 13500,
  wrappers: [
    {
      portfolioId: 101,
      portfolioShortName: "ISA-SS",
      wrapperType: "STOCKS_SHARES_ISA",
      allowanceTotalGBP: 20000,
      usedGBP: 4500,
      remainingGBP: 15500,
      portfolioCurrency: "GBP",
    },
    {
      portfolioId: 102,
      portfolioShortName: "ISA-CASH",
      wrapperType: "CASH_ISA",
      allowanceTotalGBP: 20000,
      usedGBP: 2000,
      remainingGBP: 18000,
      portfolioCurrency: "GBP",
    },
    {
      portfolioId: 301,
      portfolioShortName: "JISA-CHILD",
      wrapperType: "JUNIOR_ISA",
      allowanceTotalGBP: 9000,
      usedGBP: 1500,
      remainingGBP: 7500,
      portfolioCurrency: "GBP",
    },
  ],
};

const formatCurrency = (amount: number, currency: string) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);

const ProgressBar = ({
  total,
  used,
}: {
  total: number;
  used: number;
}) => {
  const percent = Math.max(0, Math.min(100, (used / Math.max(total, 1)) * 100));
  return (
    <div className="w-full h-2 bg-gray-200 rounded">
      <div
        className="h-2 bg-primary-600 rounded"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
};

const SummaryCard = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => (
  <div className="p-4 bg-white rounded-lg shadow border border-gray-100">
    <div className="text-sm text-gray-600">{label}</div>
    <div className="mt-1 text-2xl font-semibold">{value}</div>
  </div>
);

const WrapperCard = ({
  wrapper,
  currency,
}: {
  wrapper: WrapperAllowanceMock;
  currency: string;
}) => {
  const [open, setOpen] = useState(false);
  const title =
    wrapper.wrapperType === "STOCKS_SHARES_ISA"
      ? "Stocks & Shares ISA"
      : wrapper.wrapperType === "CASH_ISA"
      ? "Cash ISA"
      : wrapper.wrapperType === "JUNIOR_ISA"
      ? "Junior ISA"
      : "ISA";
  return (
    <div className="p-4 bg-white rounded-lg shadow border border-gray-100">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-base font-medium">{title}</div>
          {wrapper.portfolioShortName ? (
            <div className="text-xs text-gray-600 mt-0.5">
              {wrapper.portfolioShortName}
            </div>
          ) : null}
        </div>
        <button
          className="text-sm text-primary-600 hover:underline"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          {open ? "Hide details" : "View details"}
        </button>
      </div>
      <div className="mt-3 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Used</span>
          <span>{formatCurrency(wrapper.usedGBP, currency)}</span>
        </div>
        <ProgressBar total={wrapper.allowanceTotalGBP} used={wrapper.usedGBP} />
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Remaining</span>
          <span className="font-medium">
            {formatCurrency(wrapper.remainingGBP, currency)}
          </span>
        </div>
      </div>
      {open && (
        <div className="mt-4 border-t pt-3">
          <div className="text-sm text-gray-700">Recent subscriptions</div>
          <div className="mt-2 text-sm text-gray-500">
            Mock data only. Transaction list to be wired to backend later.
          </div>
        </div>
      )}
    </div>
  );
};

export const TaxView = () => {
  const { t } = useModifiedTranslation();
  const { portfolioId } = useParams();
  const data = mockAllowance; // mocked for MVP as requested

  const currency = data.currency || "GBP";

  const portfolioScopedWrappers = useMemo(() => {
    if (!portfolioId) return data.wrappers;
    const idNum = parseInt(portfolioId as string, 10);
    const match = data.wrappers.filter((w) => w.portfolioId === idNum);
    return match.length > 0 ? match : data.wrappers;
  }, [portfolioId]);

  const adultWrappers = portfolioScopedWrappers.filter(
    (w) => w.wrapperType !== "JUNIOR_ISA"
  );
  const juniorWrappers = portfolioScopedWrappers.filter(
    (w) => w.wrapperType === "JUNIOR_ISA"
  );

  return (
    <div className="grid gap-4">
      <div>
        <h1 className="text-2xl font-semibold">{t("tax.title", "Tax")}</h1>
        <div className="text-sm text-gray-600 mt-1">
          {t("tax.subheading", "ISA allowance (current tax year)")}
        </div>
        <div className="text-sm text-gray-600 mt-1">
          {t("tax.taxYear", {
            defaultValue: "Tax year: {{start}} – {{end}}",
            start: new Date(data.taxYearStart).toLocaleDateString(),
            end: new Date(data.taxYearEnd).toLocaleDateString(),
          })}
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <SummaryCard
          label={t("tax.overall.total", "Total")}
          value={formatCurrency(data.overallAdultIsaAllowanceTotal, currency)}
        />
        <SummaryCard
          label={t("tax.overall.used", "Used")}
          value={formatCurrency(data.overallAdultIsaUsed, currency)}
        />
        <SummaryCard
          label={t("tax.overall.remaining", "Remaining")}
          value={formatCurrency(data.overallAdultIsaRemaining, currency)}
        />
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-2">Adult ISA wrappers</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {adultWrappers.map((w) => (
            <WrapperCard key={`${w.wrapperType}-${w.portfolioId}`} wrapper={w} currency={currency} />
          ))}
        </div>
      </div>

      {juniorWrappers.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-2">Junior ISA</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {juniorWrappers.map((w) => (
              <WrapperCard key={`${w.wrapperType}-${w.portfolioId}`} wrapper={w} currency={currency} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

