import { useEffect, useState } from "react";
import { Option } from "components/ComboBox/ComboBox";

const useBuySecuritySelector = (
  selectedSellSecurityId: number | undefined,
  selectableBuySecuritiesAsOptions: Option[] | undefined,
  emptyOption: Option
) => {
  const [selectedBuySecurityOption, setSelectedBuySecurityOption] =
    useState<Option>(emptyOption);

  const isSellAndBuyEqual =
    selectedSellSecurityId === selectedBuySecurityOption?.id;
  const isValidSelectable = selectableBuySecuritiesAsOptions?.find(
    (selectableSecurity) =>
      selectableSecurity.id === selectedBuySecurityOption.id
  );
  const isOptionEmpty = selectedBuySecurityOption.id === emptyOption.id;

  useEffect(() => {
    if (isSellAndBuyEqual && !isOptionEmpty) {
      //the buy security cannot be the same as the sell
      setSelectedBuySecurityOption(emptyOption);
    }

    if (!isValidSelectable && !isOptionEmpty) {
      //the selected buy security is not in the list selectable buy securities
      setSelectedBuySecurityOption(emptyOption);
    }
  }, [emptyOption, isValidSelectable, isSellAndBuyEqual, isOptionEmpty]);

  return { selectedBuySecurityOption, setSelectedBuySecurityOption };
};

export default useBuySecuritySelector;
