import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { dateFromYYYYMMDD } from "utils/date";

interface LineChartHeaderProps {
  price?: number;
  date?: string;
  currency: string;
}

export const LineChartHeader = ({
  price,
  date,
  currency,
}: LineChartHeaderProps) => {
  const { t } = useModifiedTranslation();
  return (
    <div className="flex justify-between items-center">
      <div>{t("holdingsPage.price")}</div>
      <div className="text-right">
        <div className="text-base font-bold">
          {price !== undefined
            ? t("number", {
                value: price,
                currency,
              })
            : "-"}
        </div>
        <div className="text-sm font-medium text-gray-500">
          {date && t("date", { date: dateFromYYYYMMDD(date) })}
        </div>
      </div>
    </div>
  );
};
