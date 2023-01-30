import { gql } from "@apollo/client";

export const TRADE_ORDERS_DETAILS = gql`
  fragment TradeOrdersDetails on Transaction {
    id
    amount
    orderStatus
    securityName
    type {
      typeCode
      typeName
      typeNamesAsMap
      cashFlowEffect
      amountEffect
    }
    transactionDate
    tradeAmountInPortfolioCurrency
    parentPortfolio {
      id
    }
    reference
    extId
  }
`;
