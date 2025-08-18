## Tax Tab (ISA Allowances) — UI/UX Plan

### Purpose
Provide a dedicated, client-friendly "Tax" tab that centralizes UK ISA allowance visibility and guidance. It shows overall and per-wrapper allowance usage, tax-year context, helpful education, and quick access to relevant actions (e.g., deposit) with compliance-safe validation.

### Placement & Navigation
- Location: New top-level tab within the existing `NavTab` pattern (`src/layouts/NavTabLayout/NavTab/*`).
- Tab label: "Tax".
- Route: `tax` under the contact/portfolio route set, integrated alongside existing tabs in `NavTabRoutes`.
- Entry contexts:
  - Total investments: shows aggregated, contact-level allowance.
  - Specific portfolio: focuses the view on that portfolio’s wrapper while keeping the contact-level panel visible.

### Information Architecture
1) Header block
   - Title: "Tax"
   - Subheading: "ISA allowance (current tax year)"
   - Tax year range: "6 Apr YYYY – 5 Apr YYYY" with info tooltip.

2) Overall ISA (Adult) panel
   - Cards: Total, Used, Remaining (GBP).
   - Progress bar visualizing Used vs Total.
   - Link to HMRC info/help article.

3) Wrapper breakdown section
   - One card per wrapper (Stocks & Shares ISA, Cash ISA, Junior ISA, others if provided).
   - For each: Wrapper name; Used, Remaining; small progress indicator; "View details" affordance to expand.

4) Details drawer per wrapper (expand/collapse)
   - Recent tax-year subscriptions list (amount, date, account/portfolio).
   - CTA row: "Deposit to this ISA" (opens deposit modal pre-scoped to portfolio/wrapper).
   - Note about currency handling and rules.

5) Portfolio focus area (when navigated via a portfolio)
   - Banner: "This portfolio is a {Wrapper}"
   - Remaining allowance for this wrapper (prominent).
   - Contextual tip if remaining is low or zero.

6) Junior ISA area
   - Separate panel with its own total, used, remaining; not included in adult overall total.

7) Educational aides
   - Lightweight FAQs: "How allowance works", "What happens if I exceed the limit?", "Tax year timing".
   - Links to learn more.

### Layout & Components
- Container: Reuse the `NavTab` panel layout (`PageLayout`) with responsive grid.
- Overall ISA panel: 3 equal summary cards + progress bar.
- Wrapper cards: responsive two-column (≥md) or single-column (<md) grid.
- Details drawer: inline expansion within the card; on mobile, allow full-width collapse/expand.
- Visual hierarchy: Remaining > Used; use primary color for highlights.

### Interactions
- Expand/collapse wrapper details; persist open state per session.
- CTA "Deposit" launches existing deposit modal and auto-selects the wrapper portfolio when unambiguous.
- Refresh icon on header to re-fetch allowance data.
- Optional: Year selector dropdown (disabled/MVP off) for future multi-year browsing.

### States
- Loading: skeletons for summary cards and wrapper cards.
- Error: inline error with retry; fall back message: "We couldn't load your allowance right now.".
- Empty/Not applicable: "No ISA wrappers associated with your account." Show education and link to support.
- Zero remaining: show non-error info state with warning color; disable deposit CTA for that wrapper (still openable for guidance but submit blocked).

### Data, Currency & Rules (UI display)
- Values are in GBP as source of truth. If portfolio/account currency differs, display converted value with a tooltip: "Converted from {CCY} at {rate/date}."
- Junior ISA not counted towards adult overall; show as a separate section.
- All amounts clearly formatted with currency symbol and thousands separators.

### Validation Messaging (consistency with modal)
- Inline tip text beneath remaining: "Remaining ISA allowance: £X".
- If 0 remaining: "You have no remaining allowance for this tax year." (CTA disabled).
- If allowance is near limit (< £100 remaining): subtle warning tone.

### Accessibility
- Semantic structure: H1 Tax, H2 Overall ISA, H2 Wrapper breakdown, H3 per wrapper.
- Keyboard navigation: Expanders operable via Enter/Space; focus ring visible.
- ARIA: `aria-expanded` on expanders; errors/messages with role="status" or "alert" as appropriate.
- Sufficient color contrast for progress indicators and states.

### Internationalization
- Strings under `tax.*` namespace, e.g.:
  - `tax.title`: "Tax"
  - `tax.subheading`: "ISA allowance (current tax year)"
  - `tax.taxYear`: "Tax year: {{start}} – {{end}}"
  - `tax.overall.total`: "Total"
  - `tax.overall.used`: "Used"
  - `tax.overall.remaining`: "Remaining"
  - `tax.wrapper.depositCta`: "Deposit to this ISA"
  - `tax.wrapper.remainingHelper`: "Remaining ISA allowance: {{amount}}"
  - `tax.empty`: "No ISA wrappers associated with your account."
  - `tax.error`: "We couldn't load your allowance right now."

### Responsiveness
- Mobile: Single-column stack; details drawer slides below the card header.
- Tablet/Desktop: Two-column wrapper grid; details drawer expands inline without shifting other cards excessively.
- Avoid horizontal scroll; truncate long portfolio names with tooltip.

### Telemetry
- `tax_tab_viewed` (contactId, context: total|portfolioId).
- `tax_wrapper_expand` (wrapperType, portfolioId?).
- `tax_deposit_cta_clicked` (wrapperType, portfolioId, remaining).
- Error metrics: `tax_allowance_fetch_error`.

### Permissions & Feature Flags
- Feature flag `ff_tax_tab` controls tab visibility.
- Respect portfolio and user permissions; only show deposit CTA when `DEPOSIT` allowed on the relevant portfolio.
- If no ISA data available, show the empty state with education.

### Visual Design Specs (MVP)
- Cards: 12dp radius, subtle shadow, white background.
- Progress bars: primary color for used, gray-200 for remaining track.
- Icons: Info (tooltip), Refresh, Chevron for expanders.
- Spacing: 16px internal padding; 24px grid gaps on desktop, 12–16px on mobile.

### Implementation Notes
- Integrate with allowance hook (see ISA PRD) to fetch: overall totals and wrapper list.
- Place within `NavTabRoutes` for both total and portfolio contexts.
- Reuse existing components where possible (`LoadingIndicator`, button styles, tooltips).
- Ensure the deposit modal reads the same allowance source to keep consistency.

### Open Questions
- Do we want to expose a transactions filter in the wrapper details (date range, type)?
- Confirm ordering of wrapper cards (by remaining desc vs fixed order).
- Confirm whether to show flexible-ISA nuances or keep MVP simple.

### Success Criteria
- Users can find the "Tax" tab easily and understand their remaining ISA allowance at a glance.
- Wrapper breakdown clearly separates Junior ISA from adult allowance.
- Deposit CTA opens the modal with correct context, and users are prevented from exceeding allowances.
- Accessibility and i18n are implemented; metrics confirm engagement and low error rates.

