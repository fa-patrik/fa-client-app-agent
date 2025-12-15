import { useEffect } from "react";

const STYLE_IDS = {
  bootstrap: "formio-bootstrap-dynamic",
  formio: "formio-full-dynamic",
} as const;

/**
 * Custom hook to dynamically load Formio styles when the form is mounted
 * and remove them when unmounted. This prevents Bootstrap and Formio styles
 * from leaking into the rest of the application.
 *
 * Uses dynamic imports to load stylesheets, which Vite will handle properly
 * in both development and production builds.
 */
export const useFormioStyles = () => {
  useEffect(() => {
    const styleElements: HTMLStyleElement[] = [];

    const loadStyles = async () => {
      try {
        // Dynamically import CSS files
        // Vite will bundle these and make them available
        const [bootstrapCss, formioCss] = await Promise.all([
          import("bootstrap/dist/css/bootstrap.min.css?inline"),
          import("@formio/js/dist/formio.full.min.css?inline"),
        ]);

        // Create style elements and inject the CSS
        const createStyleElement = (id: string, cssContent: string) => {
          // Remove existing if present
          const existing = document.getElementById(id);
          if (existing) existing.remove();

          const style = document.createElement("style");
          style.id = id;
          style.textContent = cssContent;
          document.head.appendChild(style);
          return style;
        };

        styleElements.push(
          createStyleElement(
            STYLE_IDS.bootstrap,
            (bootstrapCss as { default: string }).default || ""
          )
        );

        styleElements.push(
          createStyleElement(
            STYLE_IDS.formio,
            (formioCss as { default: string }).default || ""
          )
        );
      } catch (error) {
        console.error("Failed to load Formio styles dynamically:", error);
      }
    };

    loadStyles();

    // Cleanup function to remove styles when component unmounts
    return () => {
      // Remove all dynamically added style elements
      Object.values(STYLE_IDS).forEach((id) => {
        const element = document.getElementById(id);
        if (element) {
          element.remove();
        }
      });
    };
  }, []);
};
