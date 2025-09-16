import { lazy } from "react";
import { TranslationText, TaxesTabLabel } from "components";
import { NavTabRoutes } from "layouts/NavTabLayout/NavTab/NavTabRoutes";
import { NavTabPath } from "layouts/NavTabLayout/NavTab/types";
import { PortfolioNavigationHeaderLayout } from "layouts/PortfolioNavigationHeaderLayout/PortfolioNavigationHeaderLayout";
import { Navigate, useRoutes } from "react-router-dom";

const Overview = lazy(() =>
  import("./overview").then((module) => ({ default: module.OverviewPage }))
);
const Holdings = lazy(() =>
  import("./holdings").then((module) => ({ default: module.HoldingsView }))
);
const Holding = lazy(() =>
  import("./holdings/[holdingId]").then((module) => ({
    default: module.HoldingPage,
  }))
);
const Transactions = lazy(() =>
  import("./transactions").then((module) => ({
    default: module.TransactionsPage,
  }))
);
const TransactionDetails = lazy(() =>
  import("./transactions/[transactionId]").then((module) => ({
    default: module.TransactionDetailsPage,
  }))
);
const Orders = lazy(() =>
  import("./orders").then((module) => ({ default: module.OrdersPage }))
);
const OrderDetails = lazy(() =>
  import("./orders/[orderId]").then((module) => ({
    default: module.OrderDetailsPage,
  }))
);
const Documents = lazy(() =>
  import("./documents").then((module) => ({ default: module.DocumentsPage }))
);
const Contact = lazy(() =>
  import("./contact").then((module) => ({ default: module.ContactPage }))
);
const Trading = lazy(() =>
  import("./trading").then((module) => ({ default: module.TradingPage }))
);
const Taxes = lazy(() =>
  import("./taxes").then((module) => ({ default: module.TaxesPage }))
);

export const portfolioTabRoutes: NavTabPath[] = [
  {
    path: "overview",
    tabLabel: <TranslationText translationKey="navTab.tabs.overview" />,
    tabComponent: <Overview />,
    element: null,
  },
  {
    path: "holdings",
    tabLabel: <TranslationText translationKey="navTab.tabs.holdings" />,
    tabComponent: <Holdings />,
    element: null,
  },
  {
    path: "taxes",
    tabLabel: <TaxesTabLabel />,
    tabComponent: <Taxes />,
    element: null,
  },
  {
    path: "transactions",
    tabLabel: <TranslationText translationKey="navTab.tabs.transactions" />,
    tabComponent: <Transactions />,
    element: null,
  },
  {
    path: "orders",
    tabLabel: <TranslationText translationKey="navTab.tabs.orders" />,
    tabComponent: <Orders />,
    element: null,
  },
  {
    path: "documents",
    tabLabel: <TranslationText translationKey="navTab.tabs.documents" />,
    tabComponent: <Documents />,
    element: null,
  },
  {
    path: "trading",
    tabLabel: <TranslationText translationKey="navTab.tabs.trading" />,
    tabComponent: <Trading />,
    element: null,
  },
  {
    path: "contact",
    tabLabel: <TranslationText translationKey="navTab.tabs.contact" />,
    tabComponent: <Contact />,
    element: null,
  },
];

export const portfolioRoutes = [
  {
    path: "",
    element: <Navigate to="overview" replace />,
  },
  {
    path: "",
    element: <PortfolioNavigationHeaderLayout />,
    children: [
      {
        path: "*",
        element: <NavTabRoutes routes={portfolioTabRoutes} />,
      },
    ],
  },
  {
    path: "holdings/:holdingId",
    element: <Holding />,
  },
  {
    path: "transactions/:transactionId",
    element: <TransactionDetails />,
  },
  {
    path: "orders/:orderId",
    element: <OrderDetails />,
  },
];

export const PortfolioRoutes = () => {
  return useRoutes(portfolioRoutes);
};
