## ISA Allowance Display and Deposit Validation (UK)

### Overview
Enable clients using the FA Client Portal to view ISA allowances and prevent deposits that exceed remaining allowance. This covers both per-wrapper information (e.g., Stocks & Shares ISA, Cash ISA, Junior ISA) and the overall ISA group allowance for the tax year. The deposit modal must validate against the remaining allowance and block disallowed deposits with a clear notification.

### Goals
- Show per-portfolio/per-wrapper ISA allowance usage and remaining.
- Show overall ISA group allowance, used, and remaining for the active tax year.
- Validate deposit amounts in the deposit modal against remaining ISA allowance for the relevant wrapper and block when exceeded.
- Provide clear, localized messaging and accessible UI.

### Non-Goals
- Support for non-UK wrappers or local tax rules outside of UK ISA.
- Historical allowance breakdowns beyond the current tax year.
- Transfer-in/out flows or allowance implications of withdrawals.

### Definitions and Rules (UK ISA context)
- Overall ISA group allowance: £20,000 per tax year per person (subject to HMRC changes). Applies across adult ISA wrappers combined (e.g., Cash ISA + Stocks & Shares ISA). Junior ISA has its own separate allowance (e.g., £9,000) per child.
- Wrapper types in scope: Stocks & Shares ISA, Cash ISA, Junior ISA (and future extensible types).
- Remaining allowance = max(0, total annual allowance − sum of eligible subscriptions in current tax year across the group or per wrapper, depending on the context shown).
- Currency: ISA allowance is GBP. If portfolio/account currency differs, conversions must be applied consistently, or deposits constrained to GBP accounts only. See Data & Currency section.

### Users and Entry Points
- Contact-level overview (home/overview or a dedicated allowance panel) shows overall ISA group allowance and a breakdown by wrapper.
- Portfolio-level views (for ISA portfolios) show the wrapper-specific allowance used/remaining.
- Deposit modal shows remaining allowance applicable to the selected portfolio’s wrapper and validates the input amount.

### UX Requirements
1) Contact-level Allowance Panel
   - Location: Contact overview or a new "Tax-efficient wrappers" widget.
   - Content:
     - Overall ISA: Total (e.g., £20,000), Used (sum across relevant wrappers), Remaining.
     - By Wrapper: List wrappers (Stocks & Shares ISA, Cash ISA, Junior ISA, etc.) with Used and Remaining.
     - Tax year range: Show "Tax year: 6 Apr YYYY – 5 Apr YYYY".
   - States: Loading skeleton; Error state with retry; Empty state if not applicable.

2) Portfolio-level ISA Block
   - For ISA portfolios only, display: Wrapper type, Used, Remaining for current year.
   - Show currency as GBP. If portfolio currency differs, show converted figure and original currency tooltip.

3) Deposit Modal Enhancements (`src/components/MoneyModals/DepositModalContent/DepositModalContent.tsx`)
   - Display a helper text under the amount input: "Remaining ISA allowance: £X" when the selected portfolio is an ISA wrapper.
   - Validation: If amount > remaining allowance for the wrapper, disable the submit button and show error: "You only have £{remaining} remaining in your ISA allowance for this tax year." Ensure error is announced by screen readers.
   - Edge cases: When allowance is 0, disable submit and show the same error.

### Data & Currency
- Source of truth: Backend service/GraphQL that returns allowance data computed from transactions/subscriptions within the current tax year.
- Currency: ISA allowances are defined in GBP.
  - If deposit account currency != GBP, either:
    - A) Block with message: "Deposits must be in GBP to subscribe to an ISA." (if business rules require)
    - B) Convert the entered amount to GBP using server-supplied FX and validate against GBP remaining (recommended: have backend provide both GBP and account-currency remaining to avoid drift).
- Junior ISA: Treated as a separate allowance bucket from adult ISA and should not be combined with the £20,000 total.

### Technical Design

#### Backend/GraphQL
Add a new query to fetch allowance information for a contact and portfolio wrappers. Example shape:

```graphql
query GetIsaAllowance($contactId: Long) {
  isaAllowance(contactId: $contactId) {
    taxYearStart
    taxYearEnd
    currency  # "GBP"
    overallAdultIsaAllowanceTotal  # e.g., 20000.00
    overallAdultIsaUsed
    overallAdultIsaRemaining
    wrappers {
      portfolioId
      portfolioShortName
      wrapperType  # STOCKS_SHARES_ISA | CASH_ISA | JUNIOR_ISA | OTHER
      allowanceTotalGBP
      usedGBP
      remainingGBP
      # Optional server-side conversions if available
      allowanceTotalInPortfolioCcy
      usedInPortfolioCcy
      remainingInPortfolioCcy
      portfolioCurrency
    }
  }
}
```

Server-side responsibilities:
- Identify ISA portfolios and wrapper types.
- Compute used/remaining within the current UK tax year window.
- Apply FX conversion to portfolio currency amounts when applicable (to avoid client-side inconsistencies).
- Expose a lightweight endpoint for on-demand validation (optional, see below) to double-check allowance at time of submission.

Optional mutation guard:
- The existing `importLimitedTradeOrder` should enforce server-side allowance validation. If exceeded, return an error detail that we surface in the UI.

#### Frontend

Data fetching:
- Contact-level: Extend a new hook `useGetIsaAllowance(contactId)` to fetch `GetIsaAllowance` and cache per contact.
- Portfolio-level: Filter `wrappers` by the current `portfolioId`.

Wrapper detection on client:
- Prefer using backend-provided wrapper typing (`wrapperType`). If not available, fallback mapping by `securityGroups.code` or metadata.

Deposit Modal validation (`DepositModalContent`):
- Fetch remaining allowance for the selected `portfolioId` from `useGetIsaAllowance`.
- Show helper text with remaining.
- Client-side validation: disable submit when input > remaining; show error text.
- On submit, rely on server-side validation as the source of truth; surface backend error messages if allowances changed between fetch and submit.

Internationalization (i18n):
- moneyModal.isaRemainingHelper: "Remaining ISA allowance: {{amount}}"
- moneyModal.isaExceededError: "You only have {{amount}} remaining in your ISA allowance for this tax year."
- allowancePanel.overallTitle: "ISA allowance"
- allowancePanel.taxYearLabel: "Tax year: {{start}} – {{end}}"
- allowancePanel.used: "Used"
- allowancePanel.remaining: "Remaining"

Accessibility:
- Error messages must be associated with the input and announced (aria-describedby, role=alert as appropriate).
- Ensure focus management on error and prevent hidden content from receiving focus.

### Validation Logic and Pseudocode
Client-side check in deposit modal:
```ts
const remaining = getRemainingForPortfolio(portfolioId); // in account currency or GBP with conversion
const amountIsValid = amount > 0 && amount <= remaining;
```

Server-side check (authoritative):
- If mutation receives an amount exceeding remaining at time of submission, return error with structured code like `ISA_ALLOWANCE_EXCEEDED` and remaining amount.

### Error Handling and Messaging
- Primary block message: "You only have £{remaining} remaining in your ISA allowance for this tax year."
- Fallback: "This deposit exceeds your remaining ISA allowance."
- For currency mismatch (if blocking): "Deposits must be in GBP to subscribe to an ISA."

### Telemetry & Observability
- allowance_viewed: when the allowance panel is displayed.
- deposit_modal_viewed_with_isa: when deposit modal opens for ISA portfolio.
- deposit_allowance_blocked: include amountEntered, remaining, portfolioId, wrapperType.
- deposit_submitted_isa: include amount, portfolioId, wrapperType.
- error_isa_exceeded_server: when backend rejects after submit; include drift between client remaining and server remaining if available.

### Performance
- Cache allowance query per contact; refresh on demand when opening deposit modal or after successful deposit.
- Keep the allowance payload small; prefer server-side aggregation to reduce client computation.

### Security & Compliance
- Server-side validation is mandatory; client-side checks are advisory.
- Ensure no sensitive data beyond balances/allowances is exposed.
- Log allowance validation errors server-side with minimal PII.

### Feature Flags & Rollout
- Gate under a feature flag (e.g., `ff_isa_allowance_ui` and `ff_isa_allowance_validation`).
- Phase 1: Display read-only allowances.
- Phase 2: Enable client-side validation and server-side enforcement/error surfacing.

### QA Scenarios
- User with multiple adult ISA wrappers: ensure combined overall adult ISA remaining matches sum of per-wrapper remaining rules.
- Junior ISA present: shows separate allowance and does not affect adult overall allowance.
- Exactly at limit: amount == remaining succeeds.
- Over limit by £0.01: blocked with correct messaging.
- Remaining = 0: submit disabled and error shown.
- Currency scenarios: GBP account vs non-GBP account behavior per decided rule.
- Backend rejects on race condition: client surfaces server error and remains on modal.
- i18n: Verify translations.
- Accessibility: Screen readers announce errors; focus is managed correctly.

### Acceptance Criteria
- Contact-level panel shows overall adult ISA allowance, used, remaining; and list of wrappers with used/remaining; tax year dates visible.
- Portfolio-level ISA section indicates wrapper type and remaining allowance.
- Deposit modal shows remaining allowance for ISA portfolios and blocks exceeding deposits with the defined message.
- Server-side validation prevents exceeding deposits even if client validation is bypassed; user sees the error message.
- Telemetry events emitted as specified.
- Covered by unit tests (hooks/utilities) and component tests (deposit modal validation and allowance panels).

### Affected Areas
- Frontend: New hook `useGetIsaAllowance`, UI components/panels, `DepositModalContent` enhancement, i18n keys.
- Backend: New allowance query, mutation guard on `importLimitedTradeOrder` for allowance checks.
- Analytics: New events.

### Open Questions
- Confirm mapping/detection for wrapper types from existing portfolio metadata.
- Confirm behavior for non-GBP accounts: convert vs block.
- Confirm treatment of Other ISA types or flexible ISA nuances.

### Monitoring & Alarms
- Alert on spikes of `ISA_ALLOWANCE_EXCEEDED` errors.
- Track allowance query failures rate and latency.

