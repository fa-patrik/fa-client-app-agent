/* eslint-disable import/order */
import { lazy } from "react";
import { useMemo } from "react";
import { Navigate, useRoutes } from "react-router-dom";
import { Severity } from "components/Alert/Alert";
import { Badge, PortfolioGuard, TranslationText, ContactGuard } from "components";
import { NavTabRoutes } from "layouts/NavTabLayout/NavTab/NavTabRoutes";
import { NavTabPath } from "layouts/NavTabLayout/NavTab/types";
import { MainLayout } from "layouts/MainLayout/MainLayout";
import { PortfolioNavigationHeaderLayout } from "layouts/PortfolioNavigationHeaderLayout/PortfolioNavigationHeaderLayout";
import { useGetContractIdData } from "providers/ContractIdProvider";
import { useGetContactInfo } from "api/common/useGetContactInfo";
import { useGetCalculatedTaxWrapperAllowances, isIsaWrapper } from "api/taxWrappers/useGetCalculatedTaxWrapperAllowances";
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
const Taxes = lazy(() =>
  import("./taxes").then((module) => ({ default: module.TaxesPage }))
);

const TaxesTabLabel = () => {
  const { selectedContactId } = useGetContractIdData();
  const { data: { portfolios = [] } = { portfolios: [] } } = useGetContactInfo(false, selectedContactId);
  const codes = useMemo(() => portfolios.map((p) => p.shortName).filter(Boolean) as string[], [portfolios]);
  const { data: allowances = [] } = useGetCalculatedTaxWrapperAllowances({ taxWrapperCodes: codes });
  const hasRemainingIsa = useMemo(() => allowances.some((a) => isIsaWrapper(a) && (a.remainingAllowance ?? 0) > 0), [allowances]);

  const today = new Date();
  const taxYearEnd = getUkTaxYearEnd(today);
  const daysRemaining = Math.max(0, Math.ceil((taxYearEnd.getTime() - startOfDay(today).getTime()) / (24 * 60 * 60 * 1000)));

  const shouldBadge = hasRemainingIsa && isMilestone(daysRemaining);

  return (
    <span className="flex items-center gap-1">
      <TranslationText translationKey="navTab.tabs.taxes" />
      {shouldBadge && <Badge severity={Severity.Info}>!</Badge>}
    </span>
  );
};

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function getUkTaxYearEnd(reference: Date) {
  // UK tax year ends on 5 April
  const year = reference.getMonth() > 3 || (reference.getMonth() === 3 && reference.getDate() >= 6)
    ? reference.getFullYear() + 1
    : reference.getFullYear();
  return new Date(year, 3, 5); // April is month 3 (0-based)
}

function isMilestone(daysRemaining: number) {
  const targets = [183, 92, 30];
  return targets.some((t) => Math.abs(daysRemaining - t) <= 1 || (t === 30 && daysRemaining <= 30));
}

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
    path: "taxes",
    tabLabel: <TaxesTabLabel />,
    tabComponent: (
      <PortfolioGuard>
        <Taxes />
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
