import { lazy } from "react";

const TaxesView = lazy(() =>
  import("../../views/taxes/TaxesView").then((module) => ({
    default: module.TaxesView,
  }))
);

export const TaxesPage = () => <TaxesView />;