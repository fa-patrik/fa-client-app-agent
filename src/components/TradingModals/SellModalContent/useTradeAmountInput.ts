import { useEffect, useMemo, useState } from "react";
import { round } from "utils/number";

const INPUT_MODE = {
  PERCENTAGE: "PERCENTAGE",
  CURRENCY: "CURRENCY",
};
type Keys = keyof typeof INPUT_MODE;

export interface InputModeOption {
  id: (typeof INPUT_MODE)[Keys];
  label: string;
}

export const useTradeAmountInput = (
  marketValue: number,
  currency: string,
  isTradeInUnits: boolean,
  BLOCK_SIZE: number
) => {
  const inputModesOptions = useMemo(
    () => [
      {
        id: INPUT_MODE.PERCENTAGE,
        label: "%",
      },
      {
        id: INPUT_MODE.CURRENCY,
        label: currency,
      },
    ],
    [currency]
  );

  const [{ inputValue, inputMode, inputValueAsNr }, setInputState] = useState<{
    inputMode: InputModeOption;
    inputValueAsNr: number;
    inputValue: string;
  }>({ inputMode: inputModesOptions[1], inputValue: "0", inputValueAsNr: 0 });

  const onInputModeChange = (newValue: InputModeOption) => {
    if (isNaN(marketValue)) {
      setInputState((previousState) => ({
        ...previousState,
        inputMode: newValue,
      }));
      return;
    }

    if (newValue.id === INPUT_MODE.PERCENTAGE) {
      setInputState((previousState) => {
        const newPercentage =
          (previousState.inputValueAsNr / marketValue) * 100;
        return {
          ...previousState,
          inputValue: round(newPercentage, 2).toString(),
          inputValueAsNr: newPercentage,
          inputMode: newValue,
        };
      });
    } else if (newValue.id === INPUT_MODE.CURRENCY) {
      setInputState((previousState) => {
        const newTradeAmount =
          (previousState.inputValueAsNr * marketValue) / 100;
        return {
          ...previousState,
          inputValue: round(newTradeAmount, BLOCK_SIZE).toString(),
          inputValueAsNr: newTradeAmount,
          inputMode: newValue,
        };
      });
    }
  };
  const setTradeAmountToHalf = () => {
    if (inputMode.id === INPUT_MODE.PERCENTAGE) {
      setInputState((previousState) => ({
        ...previousState,
        inputValue: "50",
        inputValueAsNr: 50,
      }));
    } else if (inputMode.id === INPUT_MODE.CURRENCY) {
      setInputState((previousState) => ({
        ...previousState,
        inputValue: round(marketValue / 2, BLOCK_SIZE).toString(),
        inputValueAsNr: marketValue / 2,
      }));
    }
  };
  const setTradeAmountToAll = () => {
    if (inputMode.id === INPUT_MODE.PERCENTAGE) {
      setInputState((previousState) => ({
        ...previousState,
        inputValue: "100",
        inputValueAsNr: 100,
      }));
    } else if (inputMode.id === INPUT_MODE.CURRENCY) {
      setInputState((previousState) => ({
        ...previousState,
        inputValue: round(marketValue, BLOCK_SIZE).toString(),
        inputValueAsNr: marketValue,
      }));
    }
  };
  const amount =
    inputMode.id === INPUT_MODE.CURRENCY
      ? round(inputValueAsNr, BLOCK_SIZE)
      : round((inputValueAsNr * marketValue) / 100, BLOCK_SIZE);
  const isTradeAmountCorrect =
    !isNaN(marketValue) && amount >= 0 && amount <= marketValue;

  //force input mode to currency and input as 0
  //whenever isTradeInUnits is changed
  useEffect(() => {
    const forcedInputMode = {
      id: INPUT_MODE.CURRENCY,
      label: currency,
    };

    setInputState((previousState) => ({
      ...previousState,
      inputMode: forcedInputMode,
      inputValue: "0",
      inputValueAsNr: 0,
    }));
  }, [isTradeInUnits, currency]);

  return {
    INPUT_MODE,
    inputValue,
    setInputState,
    inputModesOptions,
    inputMode,
    isTradeAmountCorrect,
    amount,
    setTradeAmountToAll,
    setTradeAmountToHalf,
    onInputModeChange,
  };
};
