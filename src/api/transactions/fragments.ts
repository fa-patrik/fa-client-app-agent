import { gql } from "@apollo/client";

export const TRANSACTION_FIELDS = gql`
  fragment TransactionsFields on Transaction {
    id
    amount
    securityName
    transactionDate
    type {
      typeCode
      typeName
      typeNamesAsMap
      cashFlowEffect
      amountEffect
    }
    tradeAmountInPortfolioCurrency
    security {
      id
      name
      namesAsMap
    }
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
    securityName
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
    taxType {
      namesAsMap
      id
    }
    taxType2 {
      namesAsMap
      id
    }
    tax
    tax2
  }
`;
