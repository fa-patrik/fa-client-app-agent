import { useEffect, useState } from "react";
import { Option } from "components/ComboBox/ComboBox";

const useSellSecuritySelector = (
  switchablePositionsAsOptions: Option[] | undefined,
  sellSecurityId: number | undefined,
  emptyOption: Option
) => {
  const [selectedSellSecurityOption, setSelectedSellSecurityOption] =
    useState<Option>(
      () =>
        switchablePositionsAsOptions?.find((s) => s.id === sellSecurityId) ||
        emptyOption
    );

  const isValidSelectable = switchablePositionsAsOptions?.find(
    (p) => p.id === selectedSellSecurityOption?.id
  );

  const isOptionEmpty = selectedSellSecurityOption.id === emptyOption.id;

  useEffect(() => {
    if (isOptionEmpty && isValidSelectable) {
      setSelectedSellSecurityOption(isValidSelectable);
    }

    if (!isValidSelectable && !isOptionEmpty) {
      setSelectedSellSecurityOption(emptyOption);
    }
  }, [emptyOption, isOptionEmpty, isValidSelectable]);

  return { selectedSellSecurityOption, setSelectedSellSecurityOption };
};

export default useSellSecuritySelector;
