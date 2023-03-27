import { lazy } from "react";
import { PortfolioGuard, TranslationText, ContactGuard } from "components";
import { MainLayout } from "layouts/MainLayout/MainLayout";
import { NavTabRoutes } from "layouts/NavTabLayout/NavTab/NavTabRoutes";
import { NavTabPath } from "layouts/NavTabLayout/NavTab/types";
import { PortfolioNavigationHeaderLayout } from "layouts/PortfolioNavigationHeaderLayout/PortfolioNavigationHeaderLayout";
import { Navigate, useRoutes } from "react-router-dom";
import { NotFoundView } from "views/notFoundView/notFoundView";
import { authUserMainRoutes } from "../authUser/routes";
import { PortfolioRoutes } from "./portfolio/routes";

const Overview = lazy(() =>
  import("./overview").then((module) => ({ default: module.OverviewPage }))
);
const Holdings = lazy(() =>
  import("./holdings").then((module) => ({ default: module.HoldingsPage }))
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

export const mainTabRoutes: NavTabPath[] = [
  {
    path: "overview",
    tabLabel: <TranslationText translationKey="navTab.tabs.overview" />,
    tabComponent: (
      <PortfolioGuard>
        <Overview />
      </PortfolioGuard>
    ),
    element: null,
  },
  {
    path: "holdings",
    tabLabel: <TranslationText translationKey="navTab.tabs.holdings" />,
    tabComponent: (
      <PortfolioGuard>
        <Holdings />
      </PortfolioGuard>
    ),
    element: null,
  },
  {
    path: "transactions",
    tabLabel: <TranslationText translationKey="navTab.tabs.transactions" />,
    tabComponent: (
      <PortfolioGuard>
        <Transactions />
      </PortfolioGuard>
    ),
    element: null,
  },
  {
    path: "orders",
    tabLabel: <TranslationText translationKey="navTab.tabs.orders" />,
    tabComponent: (
      <PortfolioGuard>
        <Orders />
      </PortfolioGuard>
    ),
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
    tabComponent: (
      <PortfolioGuard>
        <Trading />
      </PortfolioGuard>
    ),
    element: null,
  },
  {
    path: "contact",
    tabLabel: <TranslationText translationKey="navTab.tabs.contact" />,
    tabComponent: <Contact />,
    element: null,
  },
];

const linkedContactMainRoutes = [
  {
    path: "",
    element: <PortfolioNavigationHeaderLayout />,
    children: [
      {
        path: "*",
        element: <NavTabRoutes routes={mainTabRoutes} />,
      },
      {
        path: "",
        element: <Navigate to="overview" replace />,
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
  {
    path: "portfolio/:portfolioId/*",
    element: <PortfolioRoutes />,
  },
];

export const userWithLinkedContactRoutes = [
  {
    path: "",
    element: (
      <ContactGuard>
        <MainLayout />
      </ContactGuard>
    ),
    children: [
      ...linkedContactMainRoutes,
      ...authUserMainRoutes,
      {
        path: "*",
        element: <NotFoundView />,
      },
    ],
  },
];

export const userWithImpersonationRightsRoutes = [
  {
    path: "",
    element: (
      <ContactGuard impersonate>
        <MainLayout />
      </ContactGuard>
    ),
    children: [
      {
        path: "",
        element: <NotFoundView />,
      },
      {
        path: "",
        element: <PortfolioNavigationHeaderLayout />,
        children: [
          {
            path: "/impersonate/:contactDbId/*",
            element: <NavTabRoutes routes={mainTabRoutes} />,
          },
          {
            path: "/impersonate/:contactDbId/",
            element: <Navigate to="overview" replace />,
          },
        ],
      },
      {
        path: "/impersonate/:contactDbId/portfolio/:portfolioId/*",
        element: <PortfolioRoutes />,
      },
      {
        path: "/impersonate/:contactDbId/holdings/:holdingId",
        element: <Holding />,
      },
      {
        path: "/impersonate/:contactDbId/transactions/:transactionId",
        element: <TransactionDetails />,
      },
      {
        path: "/impersonate/:contactDbId/orders/:orderId",
        element: <OrderDetails />,
      },
      {
        path: "*",
        element: <NotFoundView />,
      },
    ],
  },
];

export const UserWithLinkedContactRoutes = () =>
  useRoutes(userWithLinkedContactRoutes);

export const UserWithImpersonationRightsRoutes = () =>
  useRoutes(userWithImpersonationRightsRoutes);
