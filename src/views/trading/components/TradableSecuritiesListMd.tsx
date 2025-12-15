import { useReducer } from "react";
import { Transition } from "@headlessui/react";
import { ReactComponent as ChevronDown } from "assets/chevron-down.svg";
import { ReactComponent as ChevronUp } from "assets/chevron-up.svg";
import { Button, DownloadableDocument, Grid } from "components";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { useNavigate } from "react-router-dom";
import { addProtocolToUrl } from "utils/url";
import { DelayRenderingTillVisible } from "./DelayRenderingTillVisible";
import type {
  TradableSecuritiesListSized,
  TradableSecuritySized,
} from "./TradableSecuritiesList";
import { dateFromYYYYMMDD } from "../../../utils/date";
import { NameWithFlag } from "../../holdings/components/NameWithFlag";

export const TradableSecuritiesListMd = ({
  data: securities,
  onBuyModalOpen,
}: TradableSecuritiesListSized) => {
  const { t } = useModifiedTranslation();
  return (
    <div className="grid grid-cols-7 items-stretch">
      <Grid.Header>
        <span className="col-span-2">{t("tradingList.gridHeader.name")}</span>
        <span>{t("tradingList.gridHeader.currency")}</span>
        <span>{t("tradingList.gridHeader.isinCode")}</span>
        <span>{t("tradingList.gridHeader.price")}</span>
        <span>{t("tradingList.gridHeader.asFor")}</span>
        <span>&nbsp;</span>
      </Grid.Header>
      {securities.map((security) => (
        <DelayRenderingTillVisible
          key={security.id}
          placeholderClassName="h-10"
        >
          <TradableSecurityMd
            {...security}
            key={security.id}
            onBuyModalOpen={onBuyModalOpen}
          />
        </DelayRenderingTillVisible>
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
  const { t } = useModifiedTranslation();
  const navigate = useNavigate();
  const [expanded, toggleExpanded] = useReducer((state) => !state, false);

  return (
    <>
      <Grid.Row key={id} className="py-2 border-t" onClick={toggleExpanded}>
        <div className="col-span-2">
          <NameWithFlag name={name} countryCode={country?.code} />
        </div>
        <div className="text-base text-gray-700">{currency}</div>
        <div className="text-base font-light">{isinCode}</div>
        <div className="text-base font-semibold">
          {latestMarketData?.price !== undefined &&
            t("number", {
              value: latestMarketData?.price,
              currency,
            })}
        </div>
        <div className="text-base font-medium text-gray-500">
          {latestMarketData?.date &&
            t("date", { date: dateFromYYYYMMDD(latestMarketData.date) })}
        </div>
        <div className="grid items-center">
          {expanded ? (
            <ChevronUp className="ml-auto text-gray-600 stroke-gray-500 w-[20px] h-[20px]" />
          ) : (
            <ChevronDown className="ml-auto text-gray-600 stroke-gray-500 w-[20px] h-[20px]" />
          )}
        </div>
      </Grid.Row>
      <Transition show={expanded}>
        <div className="grid col-span-7 grid-flow-col auto-cols-fr gap-2 items-center px-2 pb-2 border-t-transparent transition duration-100 ease-out data-closed:transform data-closed:scale-95 data-closed:opacity-0 data-enter:transform data-enter:scale-100 data-enter:opacity-100">
          <div className="text-base font-light">{isinCode}</div>
          <div className="mx-auto ">
            {url2 && (
              <DownloadableDocument
                url={addProtocolToUrl(url2)}
                label={t("tradingList.kiid")}
              />
            )}
          </div>
          <div className="mx-auto">
            {url && (
              <DownloadableDocument
                url={addProtocolToUrl(url)}
                label={t("tradingList.prospectus")}
              />
            )}
          </div>
          <div className="flex gap-2 justify-end">
            <div className="text-right">
              <Button
                isFullWidth
                size="md"
                variant="Secondary"
                onClick={() => navigate(`../holdings/${id}`)}
              >
                {t("tradingList.detailsButton")}
              </Button>
            </div>
            <div className="text-right">
              <Button size="md" onClick={() => onBuyModalOpen(security)}>
                {t("tradingList.buyButton")}
              </Button>
            </div>
          </div>
        </div>
      </Transition>
    </>
  );
};
