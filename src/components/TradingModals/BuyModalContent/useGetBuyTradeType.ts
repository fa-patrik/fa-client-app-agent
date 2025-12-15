import { useEffect, useMemo, useState } from "react";
import type { SecurityTypeCode } from "api/holdings/types";
import { SecurityTradeType } from "api/holdings/types";
import { getAllowedTradeTypesForSecurity } from "utils/trading";
import { isSecurityTypeFund } from "./BuyModalContent";

export const useGetBuyTradeType = (
  securityTags: string[] | undefined,
  securityTypeCode: SecurityTypeCode | undefined
) => {
  const [canToggleTradeType, setCanToggleTradeType] = useState(false);
  const [isTradeInUnits, setIsTradeInUnits] = useState(true);
  const securityAllowedTradeTypes = useMemo(() => {
    return getAllowedTradeTypesForSecurity(securityTags);
  }, [securityTags]);

  useEffect(() => {
    const isTradeTypeSpecified =
      securityAllowedTradeTypes[SecurityTradeType.buyUnits] ||
      securityAllowedTradeTypes[SecurityTradeType.buyTradeAmount];
    const isUnitsSupported =
      securityAllowedTradeTypes[SecurityTradeType.buyUnits];
    const isTradeAmountSupported =
      securityAllowedTradeTypes[SecurityTradeType.buyTradeAmount];
    const isUnitsDefaultTradeType = !isSecurityTypeFund(securityTypeCode);
    setCanToggleTradeType(
      isTradeTypeSpecified && isUnitsSupported && isTradeAmountSupported
    );
    setIsTradeInUnits(
      //set default trade type
      isTradeTypeSpecified
        ? isUnitsSupported &&
            (!isTradeAmountSupported || isUnitsDefaultTradeType)
        : isUnitsDefaultTradeType
    );
  }, [securityAllowedTradeTypes, securityTypeCode]);

  return { canToggleTradeType, isTradeInUnits, setIsTradeInUnits };
};
