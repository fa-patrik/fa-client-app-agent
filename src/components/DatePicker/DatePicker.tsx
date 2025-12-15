import { useEffect, useRef } from "react";
import { createPopper, type Instance as PopperInstance } from "@popperjs/core";
import { ReactComponent as CalendarSvg } from "assets/calendar.svg";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import ReactDatePicker, {
  type DatePickerProps as ReactDatePickerProps,
} from "react-date-picker";
import "./DatePicker.css";
import "./Calendar.css";

interface DatePickerProps extends ReactDatePickerProps {
  label?: string;
}

export const DatePicker = ({ label, ...props }: DatePickerProps) => {
  const { i18n } = useModifiedTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const popperInstanceRef = useRef<PopperInstance | null>(null);

  const locale =
    i18n.language === i18n.resolvedLanguage
      ? i18n.language
      : i18n.resolvedLanguage;

  useEffect(() => {
    if (!containerRef.current) return;

    // Find the calendar element when it's opened and position it
    const observer = new MutationObserver(() => {
      const calendar = containerRef.current?.querySelector(
        ".react-calendar"
      ) as HTMLElement;
      const wrapper = containerRef.current?.querySelector(
        ".react-date-picker"
      ) as HTMLElement;

      if (calendar && wrapper) {
        // Destroy existing instance if calendar was reopened
        if (popperInstanceRef.current) {
          popperInstanceRef.current.destroy();
          popperInstanceRef.current = null;
        }

        // Create new popper instance with fixed positioning
        popperInstanceRef.current = createPopper(wrapper, calendar, {
          placement: "bottom-start",
          strategy: "fixed",
          modifiers: [
            {
              name: "preventOverflow",
              options: {
                padding: 8,
                boundary: "clippingParents",
              },
            },
            {
              name: "flip",
              options: {
                fallbackPlacements: ["bottom-end", "top-start", "top-end"],
              },
            },
            {
              name: "offset",
              options: {
                offset: [0, 4],
              },
            },
          ],
        });
      } else if (!calendar && popperInstanceRef.current) {
        // Calendar closed, cleanup
        popperInstanceRef.current.destroy();
        popperInstanceRef.current = null;
      }
    });

    observer.observe(containerRef.current, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
      popperInstanceRef.current?.destroy();
      popperInstanceRef.current = null;
    };
  }, []);

  return (
    <div className="flex flex-col gap-0 w-full" ref={containerRef}>
      {label && <label className="mb-1 text-sm font-normal">{label}</label>}
      <ReactDatePicker
        calendarIcon={<CalendarSvg />}
        clearIcon={null}
        className="px-2 pt-2 pb-1.5 text-base font-normal text-gray-500 bg-gray-50 rounded-lg border border-gray-300"
        locale={locale}
        showLeadingZeros
        {...props}
      />
    </div>
  );
};
