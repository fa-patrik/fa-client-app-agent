import { Portfolio } from "api/common/useGetContactInfo";
import { PortfolioOption } from "components/PortfolioSelect/PortfolioSelect";

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
        amountDecimalCount: 2,
      },
      portfolioGroups: [{ code: "CP_TRADING" }, { code: "CP_DEPOSIT" }],
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
        amountDecimalCount: 2,
      },
      portfolioGroups: [
        { code: "CP_TRADING" },
        { code: "CP_DEPOSIT" },
        { code: "CP_CANCEL" },
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
        amountDecimalCount: 2,
      },
      portfolioGroups: [{ code: "OTHER_GROUP" }],
    },
    subOptions: [
      {
        id: 4,
        urlPrefix: "/portfolio/4",
        label: "Sub portfolio",
        details: {
          id: 4,
          name: "Sub portfolio",
          status: "A",
          shortName: "P4",
          currency: {
            securityCode: "USD",
            amountDecimalCount: 2,
          },
          portfolioGroups: [{ code: "CP_TRADING" }],
        },
      },
    ],
  },
] as (PortfolioOption & { details: Portfolio })[];
