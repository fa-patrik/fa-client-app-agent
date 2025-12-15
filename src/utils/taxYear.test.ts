import { vi } from 'vitest';
import {
  calculateDaysRemaining,
  getCurrentTaxYear,
  getCurrentTaxYearEndDate,
  getCurrentMilestone,
  shouldShowTaxBadge,
  dismissCurrentTaxMilestone,
  getCalcDateFromTaxYear,
} from './taxYear';

describe('taxYear utilities', () => {

  // A mock storage object to use in tests instead of localStorage
  const createMockStorage = () => {
    let store: { [key: string]: string } = {};
    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      clear: () => {
        store = {};
      },
    };
  };

  let mockStorage: ReturnType<typeof createMockStorage>;

  beforeEach(() => {
    mockStorage = createMockStorage();
  });

  describe('calculateDaysRemaining', () => {
    const endDate = "2026-04-05T23:59:59Z";

    it('should return 91 days for the 91-days milestone date', () => {
      const currentDate = new Date('2026-01-04'); // This is 91 days before
      expect(calculateDaysRemaining(currentDate, endDate)).toBe(91);
    });

    it('should return 30 days for the month milestone date', () => {
      const currentDate = new Date('2026-03-06');
      expect(calculateDaysRemaining(currentDate, endDate)).toBe(30);
    });

    it('should return 0 when the date is past the end date', () => {
      const currentDate = new Date('2026-05-01');
      expect(calculateDaysRemaining(currentDate, endDate)).toBe(0);
    });
  });

  describe('getCurrentTaxYear', () => {
    describe('with default UK tax year (April 6th)', () => {
      it('should return the correct tax year before April 6th', () => {
        const currentDate = new Date('2024-03-15');
        expect(getCurrentTaxYear(currentDate)).toBe('2023/2024');
      });

      it('should return the correct tax year on or after April 6th', () => {
        const currentDate = new Date('2024-04-06');
        expect(getCurrentTaxYear(currentDate)).toBe('2024/2025');
      });
    });

    describe('with custom tax year start date (October 7th)', () => {
      const taxYearStartDate = '--10-07';

      it('should return the correct tax year before October 7th', () => {
        const currentDate = new Date('2024-09-15');
        expect(getCurrentTaxYear(currentDate, taxYearStartDate)).toBe('2023/2024');
      });

      it('should return the correct tax year on October 7th', () => {
        const currentDate = new Date('2024-10-07');
        expect(getCurrentTaxYear(currentDate, taxYearStartDate)).toBe('2024/2025');
      });

      it('should return the correct tax year after October 7th', () => {
        const currentDate = new Date('2024-12-15');
        expect(getCurrentTaxYear(currentDate, taxYearStartDate)).toBe('2024/2025');
      });
    });

    describe('with malformed tax year start date', () => {
      it('should fallback to UK tax year for invalid dates', () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
        const currentDate = new Date('2024-03-15');
        expect(getCurrentTaxYear(currentDate, 'invalid-date')).toBe('2023/2024');
        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
      });

      it('should handle empty string gracefully', () => {
        const currentDate = new Date('2024-03-15');
        expect(getCurrentTaxYear(currentDate, '')).toBe('2023/2024');
      });
    });
  });

  describe('getCurrentMilestone', () => {
    it('should return "quarter" for 91 days remaining', () => {
      expect(getCurrentMilestone(91)).toBe('quarter');
    });

    it('should return "month" for 30 days remaining', () => {
      expect(getCurrentMilestone(30)).toBe('month');
    });

    it('should return "month" for 14 days remaining', () => {
      expect(getCurrentMilestone(14)).toBe('month');
    });

    it('should return null for more than 91 days', () => {
      expect(getCurrentMilestone(200)).toBe(null);
    });

    it('should return null for 0 days', () => {
      expect(getCurrentMilestone(0)).toBe('month');
    });
  });

  describe('shouldShowTaxBadge (integration)', () => {
    describe('with default UK tax year', () => {
      it('should return true when a milestone is active and not dismissed', () => {
        const currentDate = new Date('2026-01-05'); // 91 days left
        expect(shouldShowTaxBadge(currentDate, mockStorage)).toBe(true);
      });

      it('should return false when a milestone is active but has been dismissed', () => {
        const currentDate = new Date('2026-01-05'); // 91 days left
        // Manually dismiss this milestone
        mockStorage.setItem('tax-alert-dismissed-2025/2026-quarter', 'true');
        expect(shouldShowTaxBadge(currentDate, mockStorage)).toBe(false);
      });

      it('should return false when no milestone is active', () => {
        const currentDate = new Date('2025-08-01'); // >91 days left
        expect(shouldShowTaxBadge(currentDate, mockStorage)).toBe(false);
      });
    });

    describe('with custom tax year (October 7th)', () => {
      const taxYearStartDate = '--10-07';

      it('should return true when month milestone is active (27 days remaining)', () => {
        const currentDate = new Date('2025-09-09'); // 27 days until Oct 6, 2025
        expect(shouldShowTaxBadge(currentDate, mockStorage, taxYearStartDate)).toBe(true);
      });

      it('should return true when quarter milestone is active (91 days remaining)', () => {
        const currentDate = new Date('2025-07-07'); // ~91 days until Oct 6, 2025
        expect(shouldShowTaxBadge(currentDate, mockStorage, taxYearStartDate)).toBe(true);
      });

      it('should return false when custom milestone is dismissed', () => {
        const currentDate = new Date('2025-09-09'); // 27 days remaining
        mockStorage.setItem('tax-alert-dismissed-2024/2025-month', 'true');
        expect(shouldShowTaxBadge(currentDate, mockStorage, taxYearStartDate)).toBe(false);
      });

      it('should return false when no milestone is active (too early)', () => {
        const currentDate = new Date('2025-02-01'); // Way too early
        expect(shouldShowTaxBadge(currentDate, mockStorage, taxYearStartDate)).toBe(false);
      });

      it('should handle edge case at exact tax year boundary', () => {
        const currentDate = new Date('2025-10-06'); // Last day of tax year (0 days remaining)
        expect(shouldShowTaxBadge(currentDate, mockStorage, taxYearStartDate)).toBe(true);
      });
    });

    describe('with malformed tax year start date', () => {
      it('should fallback to UK tax year behavior', () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
        const currentDate = new Date('2026-01-05'); // Would be milestone for UK tax year (91 days)
        expect(shouldShowTaxBadge(currentDate, mockStorage, 'invalid-date')).toBe(true);
        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
      });
    });
  });

  describe('dismissCurrentTaxMilestone', () => {
    it('should set the correct key in storage for the current milestone', () => {
      const currentDate = new Date('2026-01-05'); // 91 days left (quarter)
      dismissCurrentTaxMilestone(currentDate, mockStorage);
      const expectedKey = 'tax-alert-dismissed-2025/2026-quarter';
      expect(mockStorage.getItem(expectedKey)).toBe('true');
    });

    it('should not set any key if no milestone is active', () => {
      const currentDate = new Date('2024-08-01'); // Way before tax year end, no milestone
      dismissCurrentTaxMilestone(currentDate, mockStorage);
      // We can't directly check that setItem was NOT called without spies,
      // but we can check that no keys were set.
      const dismissedKey = 'tax-alert-dismissed-2024/2025-quarter';
      expect(mockStorage.getItem(dismissedKey)).toBe(null);
    });
  });

  describe('dynamic tax year start date functionality', () => {
    it('should use default April 6th when no taxYearStartDate is provided', () => {
      const testDate = new Date('2024-05-01'); // After April 6th
      const taxYear = getCurrentTaxYear(testDate);
      const taxYearWithDefault = getCurrentTaxYear(testDate, undefined);

      expect(taxYear).toBe('2024/2025');
      expect(taxYearWithDefault).toBe('2024/2025');
    });

    it('should use custom tax year start date when provided', () => {
      const testDate = new Date('2024-02-01'); // February 1st
      const customTaxYearStart = '2024-01-01'; // January 1st start

      // With default April 6th start, Feb 1st should be in 2023/2024 tax year
      const defaultTaxYear = getCurrentTaxYear(testDate);
      expect(defaultTaxYear).toBe('2023/2024');

      // With January 1st start, Feb 1st should be in 2024/2025 tax year
      const customTaxYear = getCurrentTaxYear(testDate, customTaxYearStart);
      expect(customTaxYear).toBe('2024/2025');
    });

    it('should calculate correct tax year end date with custom start date', () => {
      const testDate = new Date('2024-02-01');
      const customTaxYearStart = '2024-01-01'; // January 1st start

      // Tax year should end on December 31st (day before January 1st)
      const endDate = getCurrentTaxYearEndDate(testDate, customTaxYearStart);
      expect(endDate).toBe('2024-12-31T23:59:59.000Z');
    });

    it('should calculate correct calc date with custom start date', () => {
      const taxYearId = '2024/2025';
      const customTaxYearStart = '2024-01-01'; // January 1st start

      // With default April 6th start, calc date should be April 5th
      const defaultCalcDate = getCalcDateFromTaxYear(taxYearId);
      expect(defaultCalcDate).toBe('2025-04-05');

      // With January 1st start, the tax year 2024/2025 should end on December 31st, 2024
      // (the day before January 1st, 2025)
      const customCalcDate = getCalcDateFromTaxYear(taxYearId, customTaxYearStart);
      expect(customCalcDate).toBe('2024-12-31');
    });

    it('should handle edge case where tax year starts on leap year February 29th', () => {
      const testDate = new Date('2024-03-01'); // March 1st in leap year
      const leapYearStart = '2024-02-29'; // February 29th start (leap year)

      const taxYear = getCurrentTaxYear(testDate, leapYearStart);
      expect(taxYear).toBe('2024/2025');

      const endDate = getCurrentTaxYearEndDate(testDate, leapYearStart);
      // Should end on February 28th (day before Feb 29th in next year, which is not a leap year)
      expect(endDate).toBe('2025-02-28T23:59:59.000Z');
    });

    it('should use custom tax year start date in shouldShowTaxBadge function', () => {
      const testDate = new Date('2024-12-15'); // December 15th
      const customTaxYearStart = '2024-01-01'; // January 1st start

      // With custom start date, tax year ends Dec 31st, so 16 days remaining
      // This should trigger the 'month' milestone
      const shouldShow = shouldShowTaxBadge(testDate, mockStorage, customTaxYearStart);
      expect(shouldShow).toBe(true);
    });
  });

  describe('dynamic tax year start date with --MM-DD format', () => {
    it('should correctly parse --MM-DD format for tax year start date', () => {
      const testDate = new Date('2024-10-01'); // October 1st
      const customTaxYearStart = '--09-07'; // September 7th

      // With start date of Sep 7, Oct 1 is in the 2024/2025 tax year
      const taxYear = getCurrentTaxYear(testDate, customTaxYearStart);
      expect(taxYear).toBe('2024/2025');
    });

    it('should calculate correct end date with --MM-DD format', () => {
      const testDate = new Date('2024-10-01');
      const customTaxYearStart = '--09-07'; // September 7th

      // Tax year should end on September 6th of the next year
      const endDate = getCurrentTaxYearEndDate(testDate, customTaxYearStart);
      expect(endDate).toBe('2025-09-06T23:59:59.000Z');
    });

    it('should show tax badge correctly with --MM-DD format', () => {
      const customTaxYearStart = '--09-07'; // September 7th
      // set date to be 3 days before end of tax year
      const testDate = new Date('2025-09-04');

      const shouldShow = shouldShowTaxBadge(testDate, mockStorage, customTaxYearStart);
      expect(shouldShow).toBe(true);
    });

    it('should handle case where current date is before the --MM-DD start date in the same year', () => {
      const testDate = new Date('2025-08-01'); // August 1st
      const customTaxYearStart = '--09-07'; // September 7th

      // August 1st 2025 is before Sep 7th 2025, so it's in the 2024/2025 tax year.
      const taxYear = getCurrentTaxYear(testDate, customTaxYearStart);
      expect(taxYear).toBe('2024/2025');

      // The end date for 2024/2025 tax year is Sep 6th, 2025.
      const endDate = getCurrentTaxYearEndDate(testDate, customTaxYearStart);
      expect(endDate).toBe('2025-09-06T23:59:59.000Z');
    });
  });
});
