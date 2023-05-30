import { useReducer } from "react";
import { Transition } from "@headlessui/react";
import { ReactComponent as ChevronDown } from "assets/chevron-down.svg";
import { ReactComponent as ChevronUp } from "assets/chevron-up.svg";
import classNames from "classnames";
import { Button, DownloadableDocument, Grid } from "components";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { useNavigate } from "react-router";
import { addProtocolToUrl } from "utils/url";
import { dateFromYYYYMMDD } from "../../../utils/date";
import { NameWithFlag } from "../../holdings/components/NameWithFlag";
import { DelayRenderingTillVisible } from "./DelayRenderingTillVisible";
import {
  TradableSecuritiesListSized,
  TradableSecuritySized,
} from "./TradableSecuritiesList";

export const TradableSecuritiesListBase = ({
  data: securities,
  onBuyModalOpen,
}: TradableSecuritiesListSized) => {
  const { t } = useModifiedTranslation();
  return (
    <div className="grid grid-cols-4 items-center">
      <Grid.Header>
        <span className="col-span-2">
          {t("tradingList.gridHeader.isinCode")}
        </span>
        <span className="col-span-2"> {t("tradingList.gridHeader.price")}</span>
      </Grid.Header>
      {securities.map((security) => (
        <DelayRenderingTillVisible
          key={security.id}
          placeholderClassName="h-16 mt-2"
        >
          <TradableSecurityBase
            {...security}
            key={security.id}
            onBuyModalOpen={onBuyModalOpen}
          />
        </DelayRenderingTillVisible>
      ))}
    </div>
  );
};

const TradableSecurityBase = (security: TradableSecuritySized) => {
  const {
    id,
    name,
    isinCode,
    latestMarketData,
    currency: { securityCode: currency },
    url,
    url2,
    onBuyModalOpen,
    country,
  } = security;
  const { t } = useModifiedTranslation();
  const navigate = useNavigate();
  const [expanded, toggleExpanded] = useReducer((state) => !state, false);
  return (
    <>
      <Grid.Row
        key={`${id}_top`}
        className="pt-2 border-t"
        onClick={toggleExpanded}
      >
        <div className="flex col-span-4 gap-2 justify-between items-center">
          <NameWithFlag name={name} countryCode={country?.code} />
          <div>
            {expanded ? (
              <ChevronUp className="ml-auto text-gray-600 stroke-gray-500 w-[20px] h-[20px]" />
            ) : (
              <ChevronDown className="ml-auto text-gray-600 stroke-gray-500 w-[20px] h-[20px]" />
            )}
          </div>
        </div>
      </Grid.Row>
      <Grid.Row
        key={`${id}_bottom`}
        className={classNames({ "pb-2": !expanded })}
        onClick={toggleExpanded}
      >
        <div className="col-span-2 text-base font-light">{isinCode}</div>
        <div className="col-span-2">
          <div className="text-base font-semibold leading-none">
            {latestMarketData &&
              t("number", {
                value: latestMarketData?.price,
                currency,
              })}
          </div>
          <div className="text-xs font-medium text-gray-500">
            {latestMarketData &&
              t("date", { date: dateFromYYYYMMDD(latestMarketData.date) })}
          </div>
        </div>
      </Grid.Row>
      <Transition
        enter="transition duration-100 ease-out"
        enterFrom="transform scale-95 opacity-0"
        enterTo="transform scale-100 opacity-100"
        leave="transition duration-75 ease-out"
        leaveFrom="transform scale-100 opacity-100"
        leaveTo="transform scale-95 opacity-0"
        className="grid col-span-4 grid-flow-col auto-cols-fr gap-2 items-center px-2 pt-1 pb-2 border-t-transparent"
        show={expanded}
      >
        <div className="sm:flex col-span-2 justify-around">
          <div className="w-fit">
            {url2 && (
              <DownloadableDocument
                url={addProtocolToUrl(url2)}
                label={t("tradingList.kiid")}
              />
            )}
          </div>
          <div className="w-fit">
            {url && (
              <DownloadableDocument
                url={addProtocolToUrl(url)}
                label={t("tradingList.prospectus")}
              />
            )}
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <div className="text-right">
            <Button
              isFullWidth
              size="md"
              variant="Secondary"
              onClick={() => navigate(`holdings/${id}`)}
            >
              {t("tradingList.detailsButton")}
            </Button>
          </div>
          <div className="text-right">
            <Button
              isFullWidth
              size="md"
              onClick={() => onBuyModalOpen(security)}
            >
              {t("tradingList.buyButton")}
            </Button>
          </div>
        </div>
      </Transition>
    </>
  );
};
