import { Button, DownloadableDocument, Grid } from "components";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { useNavigate } from "react-router";
import { dateFromYYYYMMDD } from "utils/date";
import { addProtocolToUrl } from "utils/url";
import { NameWithFlag } from "../../holdings/components/NameWithFlag";
import {
  TradableSecuritiesListSized,
  TradableSecuritySized,
} from "./TradableSecuritiesList";

export const TradableSecuritiesListXl = ({
  data: securities,
  onBuyModalOpen,
}: TradableSecuritiesListSized) => {
  const { t } = useModifiedTranslation();
  return (
    <div className="grid grid-cols-10 items-stretch">
      <Grid.Header>
        <span className="col-span-3">{t("tradingList.gridHeader.name")}</span>
        <span>{t("tradingList.gridHeader.isinCode")}</span>
        <span>{t("tradingList.gridHeader.currency")}</span>
        <span>{t("tradingList.gridHeader.price")}</span>
        <span>{t("tradingList.gridHeader.asFor")}</span>
        <span>{t("tradingList.prospectus")}</span>
        <span>{t("tradingList.kiid")}</span>
        <span>&nbsp;</span>
      </Grid.Header>
      {securities.map((security) => (
        <TradableSecurityMd
          {...security}
          key={security.id}
          onBuyModalOpen={onBuyModalOpen}
        />
      ))}
    </div>
  );
};

const TradableSecurityMd = (security: TradableSecuritySized) => {
  const {
    id,
    name,
    currency: { securityCode: currency },
    url,
    url2,
    isinCode,
    onBuyModalOpen,
    country,
    latestMarketData,
  } = security;
  const navigate = useNavigate();
  const { t } = useModifiedTranslation();
  return (
    <>
      <Grid.Row key={id} className="py-2 border-t">
        <div className="col-span-3">
          <NameWithFlag name={name} countryCode={country?.code} />
        </div>
        <div className="text-xs md:text-base font-light">{isinCode ?? "-"}</div>
        <div className="pl-2 text-base text-gray-700">{currency}</div>
        <div className="text-base font-semibold">
          {latestMarketData &&
            t("number", {
              value: latestMarketData?.price,
              currency,
            })}
        </div>
        <div className="text-base font-medium text-gray-500">
          {latestMarketData &&
            t("date", { date: dateFromYYYYMMDD(latestMarketData.date) })}
        </div>
        <div>
          {url ? (
            <DownloadableDocument url={addProtocolToUrl(url)} label="" />
          ) : (
            "-"
          )}
        </div>
        <div>
          {url2 ? (
            <DownloadableDocument url={addProtocolToUrl(url2)} label="" />
          ) : (
            "-"
          )}
        </div>
        <div className="flex gap-2 justify-end items-start pl-4">
          <Button
            isFullWidth
            size="xs"
            variant="Secondary"
            onClick={() => navigate(`holdings/${id}`)}
          >
            {t("tradingList.detailsButton")}
          </Button>
          <Button
            isFullWidth
            size="xs"
            onClick={() => onBuyModalOpen(security)}
          >
            {t("tradingList.buyButton")}
          </Button>
        </div>
      </Grid.Row>
    </>
  );
};
