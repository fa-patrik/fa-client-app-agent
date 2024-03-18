import { Attribute } from "api/common/useGetPortfoliosWithProfileAndFigures";

/**
 * Profile values can be stored as strings
 * even though they are numbers. This function
 * will check the type of the value and convert it
 * to number if it is a string.
 */
export const getDefaultValueAsNumber = (
  value: Attribute["defaultValue"] | undefined
) => {
  if (!value) return;
  if (typeof value === "number") return value;
  if (value instanceof Date || typeof value === "boolean") return;
  if (typeof value === "string" && !isNaN(Number(value))) {
    return Number(value);
  }
};
