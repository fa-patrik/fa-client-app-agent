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
  marketValue: number | undefined,
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
    inputValueAsNr: number | undefined;
    inputValue: string;
  }>({
    inputMode: inputModesOptions[1],
    inputValue: "",
    inputValueAsNr: undefined,
  });

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
      inputValue: "",
      inputValueAsNr: undefined,
    }));
  }, [isTradeInUnits, currency]);

  const onInputModeChange = (newValue: InputModeOption) => {
    if (marketValue !== undefined && isNaN(marketValue)) {
      setInputState((previousState) => ({
        ...previousState,
        inputMode: newValue,
      }));
      return;
    }

    if (newValue.id === INPUT_MODE.PERCENTAGE) {
      setInputState((previousState) => {
        const newPercentage =
          previousState.inputValueAsNr !== undefined &&
          marketValue !== undefined
            ? (previousState.inputValueAsNr / marketValue) * 100
            : undefined;
        return {
          ...previousState,
          inputValue:
            newPercentage !== undefined
              ? round(newPercentage, 2).toString()
              : "",
          inputValueAsNr: newPercentage,
          inputMode: newValue,
        };
      });
    } else if (newValue.id === INPUT_MODE.CURRENCY) {
      setInputState((previousState) => {
        const newTradeAmount =
          previousState.inputValueAsNr !== undefined &&
          marketValue !== undefined
            ? (previousState.inputValueAsNr * marketValue) / 100
            : undefined;
        return {
          ...previousState,
          inputValue:
            newTradeAmount !== undefined
              ? round(newTradeAmount, BLOCK_SIZE).toString()
              : "",
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
        inputValue: marketValue ? "50" : "",
        inputValueAsNr: marketValue ? 50 : undefined,
      }));
    } else if (inputMode.id === INPUT_MODE.CURRENCY) {
      setInputState((previousState) => {
        return {
          ...previousState,
          inputValue: marketValue
            ? round(marketValue / 2, BLOCK_SIZE).toString()
            : "",
          inputValueAsNr: marketValue ? marketValue / 2 : undefined,
        };
      });
    }
  };
  const setTradeAmountToAll = () => {
    if (inputMode.id === INPUT_MODE.PERCENTAGE) {
      setInputState((previousState) => ({
        ...previousState,
        inputValue: marketValue ? "100" : "",
        inputValueAsNr: marketValue ? 100 : undefined,
      }));
    } else if (inputMode.id === INPUT_MODE.CURRENCY) {
      setInputState((previousState) => ({
        ...previousState,
        inputValue: marketValue
          ? round(marketValue, BLOCK_SIZE).toString()
          : "",
        inputValueAsNr: marketValue ? marketValue : undefined,
      }));
    }
  };
  const amount =
    inputValueAsNr && marketValue !== undefined
      ? inputMode.id === INPUT_MODE.CURRENCY
        ? round(inputValueAsNr, BLOCK_SIZE)
        : round((inputValueAsNr * marketValue) / 100, BLOCK_SIZE)
      : 0;
  const isTradeAmountCorrect =
    marketValue !== undefined &&
    !isNaN(marketValue) &&
    amount >= 0 &&
    amount <= marketValue;

  return {
    INPUT_MODE,
    inputValue,
    inputValueAsNr,
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
