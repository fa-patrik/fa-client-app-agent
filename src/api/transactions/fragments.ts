import { gql } from "@apollo/client";

export const TRANSACTION_FIELDS = gql`
  fragment TransactionsFields on Transaction {
    id
    amount
    transactionDate
    type {
      typeCode
      typeName
      typeNamesAsMap
      cashFlowEffect
      amountEffect
    }
    tradeAmountInPortfolioCurrency
    securityName
    parentPortfolio {
      id
    }
    reference
    extId
    orderStatus
  }
`;

export const TRANSACTION_DETAILS_FIELDS = gql`
  fragment TransactionDetailsFields on Transaction {
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
`;
