export type SetValueFunc = (value: string) => void;

export const sanitizeNumberInputValue = (
  value: string,
  min: number | undefined,
  max: number | undefined,
  decimalPlaces: number
): string => {
  let sanitizedValue = value.replace(/[^0-9.]/g, ""); // remove non-digits and non-decimals

  // Remove extra decimal points if any
  const parts = sanitizedValue.split(".");
  if (parts.length > 2) {
    sanitizedValue = parts[0] + "." + parts.slice(1).join("");
  }

  // Remove leading zeroes
  const [integerPart, decimalPart] = sanitizedValue.split(".");
  if (integerPart !== "0" && integerPart.startsWith("0")) {
    sanitizedValue =
      integerPart.replace(/^0+/, "") + (decimalPart ? "." + decimalPart : "");
  }

  const numberValue = parseFloat(sanitizedValue);
  if (max !== undefined && numberValue > max) {
    sanitizedValue = max.toString();
  } else if (min !== undefined && numberValue < min) {
    sanitizedValue = min.toString();
  }

  // Limit to n decimal places
  if (
    sanitizedValue.includes(".") &&
    sanitizedValue.split(".")[1].length > decimalPlaces
  ) {
    sanitizedValue = numberValue.toFixed(decimalPlaces);
  }

  return sanitizedValue;
};

export const handleNumberInputEvent = (
  event: React.FormEvent<HTMLInputElement>,
  setValue: SetValueFunc,
  min = 0,
  max: number | undefined,
  decimalPlaces = 2
): void => {
  const target = event.currentTarget;
  if (target instanceof HTMLInputElement) {
    const sanitizedValue = sanitizeNumberInputValue(
      target.value,
      min,
      max,
      decimalPlaces
    );
    setValue(sanitizedValue);
  }
};

export const handleNumberPasteEvent = (
  event: React.ClipboardEvent,
  setValue: SetValueFunc,
  min = 0,
  max: number | undefined,
  decimalPlaces = 2
): void => {
  event.preventDefault();
  const text = event.clipboardData.getData("text");
  const sanitizedValue = sanitizeNumberInputValue(
    text,
    min,
    max,
    decimalPlaces
  );
  setValue(sanitizedValue);
};
