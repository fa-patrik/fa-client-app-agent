import colors from "tailwindcss/colors";
import plugin from "tailwindcss/plugin";

export default {
  darkMode: 'class',
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/contact.html"],
  safelist: [],
  theme: {
    extend: {
      colors: {
        primary: colors.blue,

        /**
         * Colors applied to selected contact avatars.
         * You can define however many you need,
         * but always have at least avatar_0 defined.
         */
        avatar_0: "#0A680F",
        avatar_1: "#3130ff",
        avatar_2: "#9F059F",
        avatar_3: "#003000",
        avatar_4: "#B60203",
        avatar_5: "#934100",
        avatar_6: "#5D5C00",
        avatar_7: "#00636B",
        avatar_8: "#660033",
        avatar_9: "#000066",
        error: {
          default: colors.red,
          bg: colors.red[100],
          border: colors.red[200],
          text: colors.red[800],
        },
        success: {
          default: colors.green,
          bg: colors.green[100],
          border: colors.green[200],
          text: colors.green[600],
        },
        warning: {
          default: colors.amber,
          bg: colors.amber[100],
          border: colors.amber[200],
          text: colors.amber[500],
        },
        info: {
          default: colors.blue,
          bg: colors.blue[100],
          border: colors.blue[200],
          text: colors.blue[800],
        },
      },
      fontSize: {
        xs: ["0.75rem", "150%"],
        sm: ["0.875rem", "150%"],
        base: ["1rem", "150%"],
        lg: ["1.125rem", "150%"],
        xl: ["1.125rem", "150%"],
        "2xl": ["1.5rem", "150%"],
        "3xl": ["1.875rem", "150%"],
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "system-ui",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "Noto Sans",
          "sans-serif",
          "Apple Color Emoji",
          "Segoe UI Emoji",
          "Segoe UI Symbol",
          "Noto Color Emoji",
        ],
        body: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "system-ui",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "Noto Sans",
          "sans-serif",
          "Apple Color Emoji",
          "Segoe UI Emoji",
          "Segoe UI Symbol",
          "Noto Color Emoji",
        ],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "Liberation Mono",
          "Courier New",
          "monospace",
        ],
      },
      transitionProperty: {
        width: "width",
      },
      textDecoration: ["active"],
    },
  },
  plugins: [
    plugin(function ({ addUtilities }) {
      addUtilities({
        ".scroll-hidden::-webkit-scrollbar": {
          display: "none",
        },
        ".scroll-hidden": {
          "-ms-overflow-style": "none",
          "-scrollbar-width": "none",
        },
      });
    }),
  ],
};

