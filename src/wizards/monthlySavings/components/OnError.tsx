import { Button, ErrorMessage, LoadingIndicator } from "components";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";

interface OnErrorProps {
  id?: string;
  refetchData: () => Promise<unknown>;
  networkStatus: number;
}

const OnError: React.FC<OnErrorProps> = ({
  refetchData,
  networkStatus,
  id,
}) => {
  const { t } = useModifiedTranslation();

  return (
    <div className="p-4 m-auto w-full h-full">
      <ErrorMessage header={t("messages.noCachedDataInfo")}>
        {networkStatus === 4 ? (
          <LoadingIndicator center size="sm" />
        ) : (
          <Button
            id={id ? `${id}-refetchDataButton` : undefined}
            onClick={async () => {
              await refetchData();
            }}
            variant="Transparent"
          >
            <span className="text-primary-500 underline">
              {t("wizards.monthlySavings.stepOne.refetchDataButtonLabel")}
            </span>
          </Button>
        )}
      </ErrorMessage>
    </div>
  );
};

export default OnError;
