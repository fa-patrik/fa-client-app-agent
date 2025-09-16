import { NotificationDot } from "components/NotificationDot/NotificationDot";
import { TranslationText } from "components/TranslationText/TranslationText";
import { useTaxesNotification } from "providers/TaxesNotificationProvider";

export const TaxesTabLabel = () => {
  const { isVisible } = useTaxesNotification();

  return (
    <div className="flex relative items-center">
      <TranslationText translationKey="navTab.tabs.taxes" />
      <NotificationDot show={isVisible} />
    </div>
  );
};
