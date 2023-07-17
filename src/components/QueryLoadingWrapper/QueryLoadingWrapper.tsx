import { QueryData } from "api/types";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { toast } from "react-toastify";
import { Card } from "../Card/Card";
import { ErrorMessage } from "../ErrorMessage/ErrorMessage";
import { LoadingIndicator } from "../LoadingIndicator/LoadingIndicator";

export interface QueryLoadingWrapperProps<T> extends QueryData<T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  SuccessComponent: (props: any) => JSX.Element; // Let SuccessComponent accept any props
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  successComponentProps?: any; // New prop for SuccessComponent's props
}

const QUERY_ERROR_TOAST_ID = "QUERY_ERROR_TOAST_ID";

export const QueryLoadingWrapper = <TData,>({
  loading,
  error,
  data,
  SuccessComponent,
  successComponentProps,
}: QueryLoadingWrapperProps<TData>) => {
  const { t } = useModifiedTranslation();
  if (error) {
    toast.error(t("messages.queryErrorWarning"), {
      toastId: QUERY_ERROR_TOAST_ID,
    });
  }
  if (data) {
    return <SuccessComponent data={data} {...successComponentProps} />;
  }
  // when offline and do not have cached data returns data === undefined, no error and not loading
  if (error && !data) {
    return (
      <Card>
        <ErrorMessage header={t("messages.noCachedData")}>
          {t("messages.noCachedDataInfo")}
        </ErrorMessage>
      </Card>
    );
  }
  return <LoadingIndicator center />;
};
