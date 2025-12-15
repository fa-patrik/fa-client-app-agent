import Color from "colorjs.io";
import colors from "tailwindcss/colors";
// @ts-expect-error type is any
import tailwindConfig from "../tailwind.config.js";

interface TailwindTheme {
  colors: {
    primary: Record<string, string>;
    avatarColors: string[];
  };
  screens: Record<string, string>;
}

/**
 * Convert OKLCH color string to hex format for compatibility with libraries
 * like ApexCharts that don't support OKLCH
 */
function oklchToHex(oklchString: string): string {
  try {
    const color = new Color(oklchString);
    return color.to("srgb").toString({ format: "hex" });
  } catch (error) {
    console.warn(`Failed to convert color ${oklchString}:`, error);
    return oklchString; // Return original if conversion fails
  }
}

/**
 * Convert all colors in an object to hex format
 */
function convertColorsToHex(
  colorObj: Record<string, string>
): Record<string, string> {
  return Object.entries(colorObj).reduce<Record<string, string>>(
    (acc, [key, value]) => {
      acc[key] = oklchToHex(value);
      return acc;
    },
    {}
  );
}

// Extract avatar colors from tailwind config
const avatarColors = Object.entries(tailwindConfig.theme.extend.colors).reduce<
  string[]
>((prev, curr) => {
  const [key, value] = curr;
  if (key.includes("avatar_")) prev.push(value as string);
  return prev;
}, []);

// Convert Tailwind's OKLCH colors to hex for ApexCharts compatibility
const theme: TailwindTheme = {
  colors: {
    primary: convertColorsToHex(colors.blue),
    avatarColors: avatarColors,
  },
  screens: {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
  },
};

export default theme;
