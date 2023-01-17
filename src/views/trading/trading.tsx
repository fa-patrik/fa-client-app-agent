import { useCallback } from "react";
import { useGetTradebleSecurities } from "api/trading/useGetTradebleSecurities";
import { Card, Input, QueryLoadingWrapper, Select } from "components";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { useStateWithDebounceCallback } from "hooks/useStateWithDebounceCallback";
import { TradableSecuritiesList } from "./components/TradableSecuritiesList";

export const TradingView = () => {
  const { t } = useModifiedTranslation();
  const { filters, setFilters, filterOptions, ...queryData } =
    useGetTradebleSecurities();

  const { value, setValue } = useStateWithDebounceCallback(
    useCallback(
      (newValue: string) => setFilters({ name: newValue }),
      [setFilters]
    )
  );

  return (
    <div className="flex relative flex-col gap-4">
      <Card>
        <div className="grid md:flex grid-cols-2 gap-2 p-2 text-normal">
          <div className="col-span-2 md:w-48">
            <Input
              label={t("tradingList.filters.name")}
              value={value}
              onChange={(event) => setValue(event.currentTarget.value)}
            />
          </div>
          <div className="md:w-48">
            <Select
              value={filters.country}
              onChange={(newValue) => setFilters({ country: newValue })}
              options={filterOptions.country}
              label={t("tradingList.filters.country")}
            />
          </div>
          <div className="md:w-48">
            <Select
              value={filters.type}
              onChange={(newValue) => setFilters({ type: newValue })}
              options={filterOptions.type}
              label={t("tradingList.filters.type")}
            />
          </div>
        </div>
      </Card>
      <QueryLoadingWrapper
        {...queryData}
        SuccessComponent={TradableSecuritiesList}
      />
    </div>
  );
};
