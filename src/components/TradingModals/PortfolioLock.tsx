import { faLock } from "@fortawesome/free-solid-svg-icons";
import Icon from "components/Icon/Icon";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";

const PortfolioLock = () => {
  const { t } = useModifiedTranslation();

  return (
    <div className="flex gap-x-1 items-baseline">
      <Icon severity="Warning" icon={faLock} size="small" />
      <p className="text-xs font-semibold text-yellow-500">
        {t("tradingModal.portfolioLockMessage")}
      </p>
    </div>
  );
};

export default PortfolioLock;
