import { useMemo, useState } from "react";
import { Transaction as TransactionType } from "api/transactions/types";
import { QueryData } from "api/types";
import {
  Button,
  Card,
  DatePicker,
  QueryLoadingWrapper,
  SelectFilter,
} from "components";
import { FilterOption } from "components/SelectFilter/SelectFilter";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { TransactionsContainer } from "./components/TransactionsContainer";

interface TransactionsProps extends QueryData<TransactionType[]> {
  startDate: Date;
  setStartDate: (newDate: Date) => void;
  endDate: Date;
  setEndDate: (newDate: Date) => void;
}

export const Transactions = ({
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  data,
  loading,
  error,
}: TransactionsProps) => {
  const { t } = useModifiedTranslation();
  const [transactionType, setTransactionType] = useState<FilterOption[]>([]);
  const [securityName, setSecurityName] = useState<FilterOption[]>([]);

  const [
    filteredDataByBoth,
    filteredDataBySecurityName,
    filteredDataByTransactionType,
  ] = useMemo(() => {
    if (!data) return [];
    const filteredDataByBoth = data.filter((transaction) => {
      const isTransactionTypeMatch =
        !transactionType.length ||
        transactionType.some(
          (type) => type.label === transaction.type.typeName
        );
      const isSecurityNameMatch =
        !securityName.length ||
        securityName.some((name) => name.label === transaction.securityName);

      return isTransactionTypeMatch && isSecurityNameMatch;
    });
    const filteredDataBySecurityName = data.filter((transaction) => {
      const isSecurityNameMatch =
        !securityName.length ||
        securityName.some((name) => name.label === transaction.securityName);

      return isSecurityNameMatch;
    });

    const filteredDataByTransactionType = data.filter((transaction) => {
      const isTransactionTypeMatch =
        !transactionType.length ||
        transactionType.some(
          (type) => type.label === transaction.type.typeName
        );

      return isTransactionTypeMatch;
    });

    return [
      filteredDataByBoth,
      filteredDataBySecurityName,
      filteredDataByTransactionType,
    ];
  }, [data, transactionType, securityName]);

  const { transactionTypes, securityNames } = useMemo(() => {
    const transactionTypes = filteredDataBySecurityName?.map(
      (transaction) => transaction.type.typeName
    );
    const securityNames = filteredDataByTransactionType?.map(
      (transaction) => transaction.securityName
    );

    const columnToOptions = (column: string[] | undefined) =>
      !column
        ? []
        : Array.from(new Set(column))
            .map((name, i) => ({
              id: name,
              label: name,
              value: name,
              count: column?.filter((t) => t === name).length || 0,
            }))
            .sort((a, b) => b.count - a.count);

    return {
      transactionTypes: columnToOptions(transactionTypes),
      securityNames: columnToOptions(securityNames),
    };
  }, [filteredDataBySecurityName, filteredDataByTransactionType]);

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <div className="flex gap-2 p-2 text-normal">
          <div className="md:w-48 grow md:grow-0">
            <DatePicker
              label={t("transactionsPage.datePickerFromLabel")}
              value={startDate}
              onChange={setStartDate}
              maxDate={endDate}
            />
          </div>
          <div className="md:w-48 grow md:grow-0">
            <DatePicker
              label={t("transactionsPage.datePickerFromTo")}
              value={endDate}
              onChange={setEndDate}
              minDate={startDate}
            />
          </div>
        </div>
      </Card>
      {!data?.length ? null : (
        <div className="flex flex-col gap-4 py-4 px-2">
          <div className="font-bold text-normal">Filter transactions by:</div>
          <div className="grid flex-wrap grid-cols-1 md:grid-cols-2 gap-2">
            <SelectFilter
              label={"Transaction type"}
              value={transactionType}
              options={transactionTypes}
              onChange={setTransactionType}
            />
            <SelectFilter
              label={"Security name"}
              value={securityName}
              options={securityNames}
              onChange={setSecurityName}
            />
          </div>
          <div className="self-end pb-[1]">
            <Button
              onClick={() => {
                setTransactionType([]);
                setSecurityName([]);
              }}
              disabled={!transactionType.length && !securityName.length}
              variant="Secondary"
            >
              Reset filter
            </Button>
          </div>
        </div>
      )}
      <QueryLoadingWrapper
        loading={loading}
        error={error}
        data={
          loading
            ? undefined
            : {
                transactions: filteredDataByBoth,
                startDate,
                endDate,
              }
        }
        SuccessComponent={TransactionsContainer}
      />
    </div>
  );
};
