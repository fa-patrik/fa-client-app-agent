type SetValueFunc = (value: string) => void;

const sanitizeNumberInputValue = (
  value: string,
  min: number,
  max: number,
  decimalPlaces: number
): string => {
  let sanitizedValue = value.replace(/[^0-9.]/g, ""); // remove non-digits and non-decimals

  // Remove extra decimal points if any
  const decimalPoints = sanitizedValue.split(".").length - 1;
  if (decimalPoints > 1) {
    sanitizedValue = sanitizedValue.slice(0, sanitizedValue.lastIndexOf("."));
  }

  const numberValue = parseFloat(sanitizedValue);
  if (numberValue > max) {
    sanitizedValue = max.toString();
  } else if (numberValue < min) {
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
  max = 100,
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
  max = 100,
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
