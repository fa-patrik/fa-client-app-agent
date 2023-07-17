import { TradableSecurity } from "api/trading/useGetTradebleSecurities";
import { CountryFlag } from "components";
import { useMatchesBreakpoint } from "hooks/useMatchesBreakpoint";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { v4 as uuidv4 } from "uuid";

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
  const {t,i18n } = useModifiedTranslation();
  const truncateName = (name: string) => {
    if (name.length > SECURITY_NAME_MAX_LENGTH && !isLargeScreen) {
      return name.substring(0, SECURITY_NAME_MAX_LENGTH) + ".";
    } else {
      return name;
    }
  };
  return (
    <table id={id || "securityDistributionTable"} className="w-full table-auto">
      <thead>
        <tr>
          <th className="p-1 text-sm font-normal text-left">{t("component.securityDistributionTable.securityColumHeader")}</th>
          <th className="p-1 text-sm font-normal text-right">{t("component.securityDistributionTable.percentageColumnHeader")}</th>
          <th className="p-1 text-sm font-normal text-right">{t("component.securityDistributionTable.amountColumnHeader")}</th>
        </tr>
      </thead>
      <tbody>
        {securities?.map((security) => {
          const securityAmountDistribution =
            amountDistribution?.[security.id] || 0;
          const securityPercentageDistribution =
            (securityAmountDistribution / totalAmount) * 100;
          const largest =
            (amountDistribution &&
              Object.values(amountDistribution).reduce((prev, curr) => {
                if (curr > prev) return curr;
                return prev;
              }, 0)) ||
            0;
          const fractionWidth = (securityAmountDistribution / largest) * 100;
          return (
            <tr key={`${id}-${security.id}-${uuidv4()}`}>
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
                    id={`securityDistributionTable-securityNameCell-${security.id}`}
                    className="text-xs font-bold whitespace-nowrap"
                  >
                    {truncateName(security.name)}
                  </div>
                </div>
              </td>
              <td
                id={`securityDistributionTable-percentageCell-${security.id}`}
                className="p-1 text-sm text-right"
              >
                {securityPercentageDistribution.toLocaleString(i18n.language, {
                  style: "decimal",
                  maximumFractionDigits: 3,
                  minimumFractionDigits: 2,
                })}
              </td>
              <td
                id={`securityDistributionTable-yearlyAmountCell-${security.id}`}
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
