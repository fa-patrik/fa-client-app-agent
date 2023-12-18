import { useModifiedTranslation } from "hooks/useModifiedTranslation";

interface HoldingHeaderProps {
  currency: string | undefined;
  marketValue: number | undefined;
}

export const HoldingHeader = ({
  currency,
  marketValue,
}: HoldingHeaderProps) => {
  const { t } = useModifiedTranslation();
  return (
    <div className="flex justify-between items-center">
      <div>{t("holdingsPage.holding")}</div>
      <div className="text-lg font-bold text-right">
        {marketValue !== undefined
          ? t("numberWithCurrency", {
              value: marketValue,
              currency,
            })
          : "-"}
      </div>
    </div>
  );
};
