import { Portfolio } from "api/initial/useGetContactInfo";
import { PortfolioOption } from "layouts/PortfolioNavigationHeaderLayout/PortfolioNavigationHeader/PortfolioNavigationHeader";

enum PortfolioGroups {
  CANCEL_ORDER = "CP_CANCEL",
  DEPOSIT = "CP_DEPOSIT",
  WITHDRAW = "CP_WITHDRAWAL",
  TRADE = "CP_TRADING",
}

export const portfolioOptionsMock = [
  {
    id: 1,
    urlPrefix: "/portfolio/1",
    label: "Portfolio 1",
    details: {
      id: 1,
      name: "Portfolio 1",
      status: "A",
      shortName: "P1",
      currency: {
        securityCode: "USD",
      },
      portfolioGroups: [
        { code: PortfolioGroups.TRADE },
        { code: PortfolioGroups.DEPOSIT },
      ],
    },
  },
  {
    id: 2,
    urlPrefix: "/portfolio/2",
    label: "Portfolio 2",
    details: {
      id: 2,
      name: "Portfolio 2",
      status: "A",
      shortName: "P2",
      currency: {
        securityCode: "USD",
      },
      portfolioGroups: [
        { code: PortfolioGroups.TRADE },
        { code: PortfolioGroups.DEPOSIT },
        { code: PortfolioGroups.CANCEL_ORDER },
      ],
    },
  },
  {
    id: 3,
    urlPrefix: "/portfolio/3",
    label: "Portfolio 3",
    details: {
      id: 3,
      name: "Portfolio 3",
      status: "A",
      shortName: "P3",
      currency: {
        securityCode: "USD",
      },
      portfolioGroups: [{ code: "OTHER_GROUP" }],
    },
  },
] as (PortfolioOption & { details: Portfolio })[];
