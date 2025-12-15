import { lazy } from "react";
import { PortfolioGuard, TaxesTabLabel, TranslationText } from "components";
import { DetailsLayout } from "layouts/DetailsLayout/DetailsLayout";
import type { NavTabPath } from "layouts/NavTabLayout/NavTab/types";
import { NavTabLayout } from "layouts/NavTabLayout/NavTabLayout";
import { PortfolioNavigationHeaderLayout } from "layouts/PortfolioNavigationHeaderLayout/PortfolioNavigationHeaderLayout";
import { TaxesNotificationProvider } from "providers/TaxesNotificationProvider";
import { Navigate, useRoutes } from "react-router-dom";

const PortfolioOverview = lazy(() =>
  import("./overview").then((module) => ({
    default: module.OverviewPage,
  }))
);
const PortfolioHoldings = lazy(() =>
  import("./holdings").then((module) => ({
    default: module.HoldingsView,
  }))
);
const PortfolioHolding = lazy(() =>
  import("./holdings/[holdingId]").then((module) => ({
    default: module.HoldingPage,
  }))
);
const PortfolioTransactions = lazy(() =>
  import("./transactions").then((module) => ({
    default: module.TransactionsPage,
  }))
);
const PortfolioTransactionDetails = lazy(() =>
  import("./transactions/[transactionId]").then((module) => ({
    default: module.TransactionDetailsPage,
  }))
);
const PortfolioOrders = lazy(() =>
  import("./orders").then((module) => ({
    default: module.OrdersPage,
  }))
);
const PortfolioOrderDetails = lazy(() =>
  import("./orders/[orderId]").then((module) => ({
    default: module.OrderDetailsPage,
  }))
);
const PortfolioDocuments = lazy(() =>
  import("./documents").then((module) => ({
    default: module.DocumentsPage,
  }))
);
const PortfolioContact = lazy(() =>
  import("./contact").then((module) => ({
    default: module.ContactPage,
  }))
);
const PortfolioTrading = lazy(() =>
  import("./trading").then((module) => ({
    default: module.TradingPage,
  }))
);
const PortfolioTaxes = lazy(() =>
  import("./taxes").then((module) => ({ default: module.TaxesPage }))
);

const portfolioSelectedTabs: NavTabPath[] = [
  {
    path: "overview",
    tabLabel: <TranslationText translationKey="navTab.tabs.overview" />,
    tabComponent: <PortfolioOverview />,
    element: null,
  },
  {
    path: "holdings",
    tabLabel: <TranslationText translationKey="navTab.tabs.holdings" />,
    tabComponent: <PortfolioHoldings />,
    element: null,
  },
  {
    path: "taxes",
    tabLabel: <TaxesTabLabel />,
    tabComponent: <PortfolioTaxes />,
    element: null,
  },
  {
    path: "transactions",
    tabLabel: <TranslationText translationKey="navTab.tabs.transactions" />,
    tabComponent: <PortfolioTransactions />,
    element: null,
  },
  {
    path: "orders",
    tabLabel: <TranslationText translationKey="navTab.tabs.orders" />,
    tabComponent: <PortfolioOrders />,
    element: null,
  },
  {
    path: "documents",
    tabLabel: <TranslationText translationKey="navTab.tabs.documents" />,
    tabComponent: <PortfolioDocuments />,
    element: null,
  },
  {
    path: "trading",
    tabLabel: <TranslationText translationKey="navTab.tabs.trading" />,
    tabComponent: <PortfolioTrading />,
    element: null,
  },
  {
    path: "contact",
    tabLabel: <TranslationText translationKey="navTab.tabs.contact" />,
    tabComponent: <PortfolioContact />,
    element: null,
  },
];

/** Pages when a portfolio is selected. */
const portfolioSelectedRoutes = [
  {
    path: "",
    element: <DetailsLayout />,
    children: [
      {
        path: "holdings/:holdingId",
        element: <PortfolioHolding />,
      },
      {
        path: "transactions/:transactionId",
        element: <PortfolioTransactionDetails />,
      },
      {
        path: "orders/:orderId",
        element: <PortfolioOrderDetails />,
      },
    ],
  },
  {
    path: "",
    element: <PortfolioNavigationHeaderLayout />,
    children: [
      {
        path: "*",
        element: (
          <PortfolioGuard>
            <TaxesNotificationProvider>
              <NavTabLayout routes={portfolioSelectedTabs} />
            </TaxesNotificationProvider>
          </PortfolioGuard>
        ),
        children: [
          ...portfolioSelectedTabs,
          {
            path: "*", // Catch all unknown routes and redirect to overview
            element: <Navigate to="../overview" replace />,
          },
          {
            index: true, // Catch empty path and redirect to overview
            element: <Navigate to="../overview" replace />,
          },
        ],
      },
    ],
  },
];

/**
 * Separate router for portfolio specific routes.
 * Otherwise relative navigation happens against the root route instead of the portfolio route
 */
export const PortfolioSelectedRoutes = () => {
  return useRoutes(portfolioSelectedRoutes);
};
