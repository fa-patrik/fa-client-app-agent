/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />
/// <reference types="vitest/globals" />
/// <reference types="vite-plugin-pwa/client" />

declare module "*.svg" {
  import type { FC, SVGProps } from "react";
  export const ReactComponent: FC<SVGProps<SVGSVGElement>>;
  const src: string;
  export default src;
}

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
