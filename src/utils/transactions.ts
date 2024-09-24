import { Severity } from "components/Alert/Alert";

export const getTransactionColor = (
  amountEffect: number,
  cashFlowEffect: number,
  isSwitch?: boolean
) => {
  return isSwitch
    ? Severity.Success
    : amountEffect > 0 && cashFlowEffect < 0
    ? Severity.Info
    : amountEffect < 0 && cashFlowEffect > 0
    ? Severity.Error
    : amountEffect === 0 && cashFlowEffect > 0
    ? Severity.Success
    : Severity.Neutral;
};
