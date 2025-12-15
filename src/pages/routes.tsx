import { lazy } from "react";
import {
  PortfolioGuard,
  TranslationText,
  TaxesTabLabel,
  ContactGuard,
} from "components";
import { DetailsLayout } from "layouts/DetailsLayout/DetailsLayout";
import { MainLayout } from "layouts/MainLayout/MainLayout";
import type { NavTabPath } from "layouts/NavTabLayout/NavTab/types";
import { NavTabLayout } from "layouts/NavTabLayout/NavTabLayout";
import { PortfolioNavigationHeaderLayout } from "layouts/PortfolioNavigationHeaderLayout/PortfolioNavigationHeaderLayout";
import { DetailProvider } from "providers/ContractIdProvider";
import { useKeycloak } from "providers/KeycloakProvider";
import { TaxesNotificationProvider } from "providers/TaxesNotificationProvider";
import { WizardProvider } from "providers/WizardProvider";
import { Navigate, useRoutes, type RouteObject } from "react-router-dom";
import { MissingLinkedContactGuard } from "views/missingLinkedContact/missingLinkedContact";
import { NotFoundView } from "views/notFoundView/notFoundView";
import { PortfolioSelectedRoutes } from "./portfolio/routes";

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
const Taxes = lazy(() =>
  import("./taxes").then((module) => ({ default: module.TaxesPage }))
);
const Form = lazy(() =>
  import("./form").then((module) => ({ default: module.FormPage }))
);

const noPortfolioSelectedTabs: NavTabPath[] = [
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
    path: "taxes",
    tabLabel: <TaxesTabLabel />,
    tabComponent: <Taxes />,
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

const noPortfolioSelectedRoutes: RouteObject[] = [
  {
    path: "holdings/:holdingId",
    element: (
      <DetailsLayout>
        <Holding />
      </DetailsLayout>
    ),
  },
  {
    path: "transactions/:transactionId",
    element: (
      <DetailsLayout>
        <TransactionDetails />
      </DetailsLayout>
    ),
  },
  {
    path: "orders/:orderId",
    element: (
      <DetailsLayout>
        <OrderDetails />
      </DetailsLayout>
    ),
  },
  //this page doesn't exist, redirect to overview
  { path: "form", element: <Navigate to="../overview" replace /> },
  {
    path: "form/:formKey",
    element: (
      /** The forms page applies global bootstrap styles and the UserMenu becomes misaligned */
      <DetailsLayout hideUserMenu={true}>
        <Form />
      </DetailsLayout>
    ),
  },
  {
    element: <PortfolioNavigationHeaderLayout />,
    children: [
      {
        path: "*",
        element: (
          <TaxesNotificationProvider>
            <NavTabLayout routes={noPortfolioSelectedTabs} />
          </TaxesNotificationProvider>
        ),
        children: [
          ...noPortfolioSelectedTabs,
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
 * A user with a linked contact has completed onboarding
 * and is allowed to access the main application.
 */
const userWithLinkedContactRoutes: RouteObject[] = [
  {
    element: (
      <DetailProvider>
        <ContactGuard>
          <WizardProvider>
            <MainLayout />
          </WizardProvider>
        </ContactGuard>
      </DetailProvider>
    ),
    children: [
      ...noPortfolioSelectedRoutes,
      {
        path: "portfolio/:portfolioId/*",
        element: <PortfolioSelectedRoutes />,
      },
    ],
  },
];

const UserWithLinkedContactRouter = () => {
  return useRoutes(userWithLinkedContactRoutes);
};

const userWithImpersonationAccessRoutes: RouteObject[] = [
  {
    path: "impersonate/:impersonateId/*",
    element: <UserWithLinkedContactRouter />,
  },
  {
    path: "*",
    element: <NotFoundView />,
  },
];

const UserWithImpersonationAccessRouter = () => {
  return useRoutes(userWithImpersonationAccessRoutes);
};

const userWithoutLinkedContactRoutes = [
  {
    element: <MainLayout />,
    children: [
      {
        element: (
          <DetailsLayout
            /** These options either require a linked contact or are looking weird with bootstrap (formsio) styles applied
             * We should consider creating a separate layout for not onboarded users
             */
            hideLogo={true}
            hideUserMenu={true}
            hideBackButton={true}
            hideAvatar={true}
          />
        ),
        children: [
          {
            path: "form/:formKey",
            element: <Form />,
          },
        ],
      },
      {
        path: "*",
        element: <MissingLinkedContactGuard />,
      },
    ],
  },
];

const UserWithoutLinkedContactRouter = () => {
  return useRoutes(userWithoutLinkedContactRoutes);
};

export const Router = () => {
  const { linkedContact, access } = useKeycloak();
  if (access.impersonate) {
    // Typically a support user that can impersonate other users for support purposes
    return <UserWithImpersonationAccessRouter />;
  } else if (linkedContact) {
    // A regular user that has completed onboarding
    return <UserWithLinkedContactRouter />;
  } else {
    // A new user that has only authorized itself but not yet onboarded itself
    return <UserWithoutLinkedContactRouter />;
  }
};
