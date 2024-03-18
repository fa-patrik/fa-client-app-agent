import { useCallback } from "react";
import { Card, Input, QueryLoadingWrapper, ComboBox } from "components";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { useStateWithDebounceCallback } from "hooks/useStateWithDebounceCallback";
import { useParams } from "react-router-dom";
import { useGetPermittedSecurities } from "services/permissions/trading";
import { TradableSecuritiesList } from "./components/TradableSecuritiesList";

export const TradingView = () => {
  const { t } = useModifiedTranslation();

  const { portfolioId } = useParams();
  const portfolioIdAsNumber = portfolioId
    ? parseInt(portfolioId, 10)
    : undefined;

  const {
    filters,
    setFilters,
    filterOptions,
    data: tradableSecurities,
    loading,
    error,
  } = useGetPermittedSecurities(undefined, portfolioIdAsNumber);

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
            <ComboBox
              value={filters.country}
              onChange={(newValue) => setFilters({ country: newValue })}
              options={filterOptions.country}
              label={t("tradingList.filters.country")}
            />
          </div>
          <div className="md:w-48">
            <ComboBox
              value={filters.type}
              onChange={(newValue) => setFilters({ type: newValue })}
              options={filterOptions.type}
              label={t("tradingList.filters.type")}
            />
          </div>
        </div>
      </Card>
      <QueryLoadingWrapper
        data={tradableSecurities}
        loading={loading}
        error={error}
        SuccessComponent={TradableSecuritiesList}
      />
    </div>
  );
};
