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
    linkedTransaction {
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
  }
`;

export const TRADE_ORDERS_EXTENDED_DETAILS = gql`
  fragment TradeOrderExtendedDetails on Transaction {
    id
    amount
    security {
      id
      isinCode
      country {
        code
      }
      exchange {
        id
        name
      }
    }
    settlementDate
    unitPriceInSecurityCurrency: unitPriceView
    costInSecurityCurrency: totalCost
    accountFxRate: accountFxRateView
    documents(filterTags: $filterTags) {
      identifier
    }
    extInfo
    marketPlace {
      id
      name
    }
    account {
      currency {
        accountCurrencyCode: securityCode
      }
    }
    securityCurrencyCode: currencyCode
    tradeAmountInAccountCurrency
    tradeAmountInSecurityCurrency: tradeAmount
    grossPriceInSecurityCurrency: grossPrice
    grossPriceInAccountCurrency
    orderStatus
    linkedTransaction {
      id
      amount
      security {
        id
        isinCode
        country {
          code
        }
        exchange {
          id
          name
        }
      }
      settlementDate
      unitPriceInSecurityCurrency: unitPriceView
      costInSecurityCurrency: totalCost
      accountFxRate: accountFxRateView
      documents(filterTags: $filterTags) {
        identifier
      }
      extInfo
      marketPlace {
        id
        name
      }
      account {
        currency {
          accountCurrencyCode: securityCode
        }
      }
      securityCurrencyCode: currencyCode
      tradeAmountInAccountCurrency
      tradeAmountInSecurityCurrency: tradeAmount
      grossPriceInSecurityCurrency: grossPrice
      grossPriceInAccountCurrency
      orderStatus
    }
  }
`;
