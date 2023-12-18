export const getNameFromBackendTranslations = (
  fallbackTranslation: string,
  locale: string,
  backendTranslationsMap: Record<string, string> = {}
) => {
  return (
    backendTranslationsMap[locale.replace("-", "_")] || fallbackTranslation
  );
};

export const getTransactionColor = (
  amountEffect: number,
  cashFlowEffect: number,
  isSwitch?: boolean
) => {
  return isSwitch
    ? "green"
    : amountEffect > 0 && cashFlowEffect < 0
    ? ("blue" as const)
    : amountEffect < 0 && cashFlowEffect > 0
    ? ("red" as const)
    : amountEffect === 0 && cashFlowEffect > 0
    ? ("green" as const)
    : ("gray" as const);
};
