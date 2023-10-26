import { TradableSecurity } from "api/trading/useGetTradebleSecurities";
import { CountryFlag } from "components";
import { useMatchesBreakpoint } from "hooks/useMatchesBreakpoint";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";

const SECURITY_NAME_MAX_LENGTH = 25;

interface SecurityDistributionTableProps {
  id?: string;
  securities: TradableSecurity[] | undefined;
  amountDistribution: Record<string, number> | undefined;
  totalAmount: number;
  portfolioCurrencyCode: string;
}

const SecurityDistributionTable = ({
  id,
  securities,
  amountDistribution,
  totalAmount,
  portfolioCurrencyCode,
}: SecurityDistributionTableProps) => {
  const isSm = useMatchesBreakpoint("sm");
  const isLargeScreen = isSm;
  const { t, i18n } = useModifiedTranslation();
  const truncateName = (name: string) => {
    if (name.length > SECURITY_NAME_MAX_LENGTH && !isLargeScreen) {
      return name.substring(0, SECURITY_NAME_MAX_LENGTH) + ".";
    } else {
      return name;
    }
  };
  return (
    <table id={id} className="w-full table-auto">
      <thead>
        <tr>
          <th className="p-1 text-sm font-normal text-left">
            {t("component.securityDistributionTable.securityColumHeader")}
          </th>
          <th className="p-1 text-sm font-normal text-right">
            {t("component.securityDistributionTable.percentageColumnHeader")}
          </th>
          <th className="p-1 text-sm font-normal text-right">
            {t("component.securityDistributionTable.amountColumnHeader")}
          </th>
        </tr>
      </thead>
      <tbody>
        {securities?.map((security, index) => {
          const securityAmountDistribution =
            amountDistribution?.[security.id] || 0;
          const denominator = totalAmount === 0 ? 1 : totalAmount;
          const securityPercentageDistribution =
            (securityAmountDistribution / denominator) * 100;
          const largest =
            (amountDistribution &&
              Object.values(amountDistribution).reduce((prev, curr) => {
                if (curr > prev) return curr;
                return prev;
              }, 0)) ||
            0;
          const fractionWidth = (securityAmountDistribution / largest) * 100;
          return (
            <tr key={id ? `${id}-row-${index}` : undefined}>
              <td className="p-1 ">
                <div
                  className="flex gap-x-2 items-center py-2 px-1 bg-green-200 rounded-lg"
                  style={{
                    width: `${fractionWidth}%`,
                  }}
                >
                  <div>
                    <CountryFlag code={security.country?.code} />
                  </div>
                  <div
                    id={
                      id
                        ? `${id}-row-${index}-securityName`
                        : `row-${index}-securityName`
                    }
                    className="text-xs font-bold whitespace-nowrap"
                  >
                    {truncateName(security.name)}
                  </div>
                </div>
              </td>
              <td
                id={
                  id
                    ? `${id}-row-${index}-percentage`
                    : `row-${index}-percentage`
                }
                className="p-1 text-sm text-right"
              >
                {securityPercentageDistribution.toLocaleString(i18n.language, {
                  style: "decimal",
                  maximumFractionDigits: 3,
                  minimumFractionDigits: 2,
                })}
              </td>
              <td
                id={id ? `${id}-row-${index}-amount` : `row-${index}-amount`}
                className="p-1 text-sm text-right"
              >
                {(amountDistribution?.[security.id] || 0).toLocaleString(
                  i18n.language,
                  {
                    style: "currency",
                    currency: portfolioCurrencyCode,
                  }
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default SecurityDistributionTable;
