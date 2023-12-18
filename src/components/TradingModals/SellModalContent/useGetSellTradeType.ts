import { useEffect, useMemo, useState } from "react";
import { SecurityTradeType, SecurityTypeCode } from "api/holdings/types";
import { getAllowedTradeTypesForSecurity } from "utils/trading";

export const useGetSellTradeType = (
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
      securityAllowedTradeTypes[SecurityTradeType.sellUnits] ||
      securityAllowedTradeTypes[SecurityTradeType.sellTradeAmount];
    const isUnitsSupported =
      securityAllowedTradeTypes[SecurityTradeType.sellUnits];
    const isTradeAmountSupported =
      securityAllowedTradeTypes[SecurityTradeType.sellTradeAmount];
    const isUnitsDefaultTradeType = true; //always true when selling
    setCanToggleTradeType(
      isTradeTypeSpecified && isUnitsSupported && isTradeAmountSupported
    );
    setIsTradeInUnits(
      //set default trade type
      isTradeTypeSpecified ? isUnitsSupported : isUnitsDefaultTradeType
    );
  }, [securityAllowedTradeTypes, securityTypeCode]);

  return { canToggleTradeType, isTradeInUnits, setIsTradeInUnits };
};
