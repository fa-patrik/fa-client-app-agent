import { ErrorMessage } from "components/ErrorMessage/ErrorMessage";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { useNavigate } from "react-router-dom";

export const NotFoundView = () => {
  const { t } = useModifiedTranslation();
  const navigate = useNavigate();
  return (
    <ErrorMessage header={t("notFoundPage.title")}>
      {t("notFoundPage.info")}
      <div
        onClick={() => navigate(-1)}
        className="font-semibold text-primary-500 cursor-pointer"
      >
        {t("notFoundPage.return")}
      </div>
    </ErrorMessage>
  );
};
