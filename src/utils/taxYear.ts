/**
 * Parses a tax year start date string and returns month and day.
 * Supports both full format (YYYY-MM-DD) and partial format (--MM-DD).
 * @param taxYearStartDateString The tax year start date in YYYY-MM-DD or --MM-DD format.
 * @returns Object with month (0-based) and day.
 */
const parseTaxYearStartDate = (taxYearStartDateString: string): { month: number; day: number } => {
  const date = new Date(taxYearStartDateString);
  
  // Validate the parsed date
  if (isNaN(date.getTime())) {
    console.error(`Invalid tax year start date format: ${taxYearStartDateString}, falling back to April 6th`);
    return { month: 3, day: 6 }; // April 6th fallback
  }
  
  return {
    month: date.getMonth(), // 0-based month
    day: date.getDate()
  };
};

/**
 * Gets the current tax year end date dynamically.
 * @param currentDate The current date.
 * @param taxYearStartDateString Optional tax year start date in YYYY-MM-DD format. Defaults to April 6th.
 * @returns The tax year end date as an ISO string.
 */
export const getCurrentTaxYearEndDate = (currentDate: Date, taxYearStartDateString?: string): string => {
  const currentYear = currentDate.getFullYear();
  
  // Parse the tax year start date or use default (April 6th)
  const { month: startMonth, day: startDay } = taxYearStartDateString 
    ? parseTaxYearStartDate(taxYearStartDateString)
    : { month: 3, day: 6 }; // April 6th (month 3 is April in 0-based indexing)
  
  const taxYearStartDate = new Date(currentYear, startMonth, startDay);
  
  // If current date is on or after the tax year start, we're in the tax year that ends next calendar year
  const isOnOrAfterTaxYearStart = currentDate >= taxYearStartDate;
  const taxYearEndYear = isOnOrAfterTaxYearStart ? currentYear + 1 : currentYear;
  
  // Tax year ends on the day before the start date in the following year
  const endDate = new Date(Date.UTC(taxYearEndYear, startMonth, startDay - 1, 23, 59, 59));
  
  return endDate.toISOString();
};

/**
 * Calculates the number of days remaining until the end date.
 * @param currentDate The current date.
 * @param endDate The end date string.
 * @returns The number of full days remaining.
 */
export const calculateDaysRemaining = (currentDate: Date, endDate: string): number => {
  const end = new Date(endDate);
  // Use UTC to avoid timezone issues in calculations
  const todayUTC = Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), currentDate.getUTCDate());
  const endUTC = Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate());
  
  const diffTime = endUTC - todayUTC;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
};

/**
 * Gets the current tax year string (e.g., "2023/2024").
 * @param currentDate The current date.
 * @param taxYearStartDateString Optional tax year start date in YYYY-MM-DD format. Defaults to April 6th.
 * @returns The tax year string.
 */
export const getCurrentTaxYear = (currentDate: Date, taxYearStartDateString?: string): string => {
  const currentYear = currentDate.getFullYear();
  
  // Parse the tax year start date or use default (April 6th)
  const { month: startMonth, day: startDay } = taxYearStartDateString 
    ? parseTaxYearStartDate(taxYearStartDateString)
    : { month: 3, day: 6 }; // April 6th (month 3 is April in 0-based indexing)
  
  const taxYearStartDate = new Date(currentYear, startMonth, startDay);
  
  // If current date is on or after the tax year start, we're in the tax year that started this calendar year
  const isOnOrAfterTaxYearStart = currentDate >= taxYearStartDate;
  const currentTaxYearStart = isOnOrAfterTaxYearStart ? currentYear : currentYear - 1;
  const currentTaxYearEnd = currentTaxYearStart + 1;
  
  return `${currentTaxYearStart}/${currentTaxYearEnd}`;
};

/**
 * Generate tax year options dynamically
 * @param taxYearStartDateString Optional tax year start date. Defaults to UK tax year (April 6th).
 */
export const generateTaxYearOptions = (taxYearStartDateString?: string): Array<{ id: string; label: string }> => {
  const currentTaxYear = getCurrentTaxYear(new Date(), taxYearStartDateString);
  const currentTaxYearStart = parseInt(currentTaxYear.split('/')[0]);
  const taxYears: Array<{ id: string; label: string }> = [];

  // Generate last 3 tax years
  for (let i = 0; i < 3; i++) {
      const startYear = currentTaxYearStart - i;
      const endYear = startYear + 1;
      const taxYearLabel = `${startYear}/${endYear}`;

      taxYears.push({
          id: taxYearLabel,
          label: taxYearLabel
      });
  }

  return taxYears;
};

/**
 * Convert tax year to calc date
 * @param taxYearId The tax year ID in format "YYYY/YYYY"
 * @param taxYearStartDateString Optional tax year start date in YYYY-MM-DD format. Defaults to April 6th.
 * @returns The calculation date string in YYYY-MM-DD format
 */
export const getCalcDateFromTaxYear = (taxYearId: string, taxYearStartDateString?: string): string => {
    const [startYear] = taxYearId.split('/');

    // Parse the tax year start date or use default (April 6th)
    const { month: startMonth, day: startDay } = taxYearStartDateString 
        ? parseTaxYearStartDate(taxYearStartDateString) 
        : { month: 3, day: 6 }; // April 6th (month 3 is April in 0-based indexing)

    // The tax year starts in the `startYear`
    const startDate = new Date(parseInt(startYear), startMonth, startDay);

    // The tax year ends one year later, minus one day
    const endDate = new Date(startDate);
    endDate.setFullYear(startDate.getFullYear() + 1);
    endDate.setDate(startDate.getDate() - 1);

    const year = endDate.getFullYear();
    const month = String(endDate.getMonth() + 1).padStart(2, '0');
    const day = String(endDate.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

/**
 * Determines the current notification milestone based on days remaining.
 * @param daysRemaining The number of days remaining.
 * @returns A string for the milestone ('quarter', 'month') or null.
 */
export const getCurrentMilestone = (daysRemaining: number): string | null => {
  if (daysRemaining < 0) return null; // Tax year has ended
  if (daysRemaining <= 30) return 'month';
  if (daysRemaining <= 91) return 'quarter';
  return null;
};

/**
 * The main logic function to determine if the tax notification badge should be shown.
 * @param currentDate The current date.
 * @param storage A storage object that implements getItem (e.g., localStorage).
 * @param taxYearStartDateString Optional tax year start date in YYYY-MM-DD format. Defaults to April 6th.
 * @returns True if the badge should be shown, otherwise false.
 */
export const shouldShowTaxBadge = (
  currentDate: Date, 
  storage: { getItem: (key: string) => string | null } = localStorage,
  taxYearStartDateString?: string
): boolean => {
  const taxYearEndDate = getCurrentTaxYearEndDate(currentDate, taxYearStartDateString);
  const daysRemaining = calculateDaysRemaining(currentDate, taxYearEndDate);
  const currentTaxYear = getCurrentTaxYear(currentDate, taxYearStartDateString);
  const currentMilestone = getCurrentMilestone(daysRemaining);
  
  if (!currentMilestone) {
    return false;
  }
  
  const dismissalKey = `tax-alert-dismissed-${currentTaxYear}-${currentMilestone}`;
  const isDismissed = storage.getItem(dismissalKey) === 'true';
  
  return !isDismissed;
};

/**
 * Logic to dismiss the current tax alert milestone.
 * @param currentDate The current date.
 * @param storage A storage object that implements setItem (e.g., localStorage).
 * @param taxYearStartDateString Optional tax year start date in YYYY-MM-DD format. Defaults to April 6th.
 */
export const dismissCurrentTaxMilestone = (
  currentDate: Date, 
  storage: { setItem: (key: string, value: string) => void } = localStorage,
  taxYearStartDateString?: string
): void => {
  const taxYearEndDate = getCurrentTaxYearEndDate(currentDate, taxYearStartDateString);
  const daysRemaining = calculateDaysRemaining(currentDate, taxYearEndDate);
  const currentTaxYear = getCurrentTaxYear(currentDate, taxYearStartDateString);
  const currentMilestone = getCurrentMilestone(daysRemaining);
  
  if (currentMilestone) {
    const dismissalKey = `tax-alert-dismissed-${currentTaxYear}-${currentMilestone}`;
    storage.setItem(dismissalKey, 'true');
  }
};

/**
 * Gets the current tax year information including label and end date.
 * @param currentDate The current date (defaults to new Date()).
 * @returns An object containing the current tax year label and end date.
 */
export const getTaxYearInfo = (currentDate: Date = new Date()): { currentTaxYearLabel: string; taxYearEndDate: Date } => {
  const currentTaxYearLabel = getCurrentTaxYear(currentDate);
  const taxYearEndDateString = getCurrentTaxYearEndDate(currentDate);
  const taxYearEndDate = new Date(taxYearEndDateString);
  
  return {
    currentTaxYearLabel,
    taxYearEndDate
  };
};
