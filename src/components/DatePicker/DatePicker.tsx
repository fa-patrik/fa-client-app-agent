import { useCallback, useState } from "react";
import { createPopper } from "@popperjs/core";
import { ReactComponent as CalendarIcon } from "assets/calendar.svg";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import ReactDatePicker, {
  DatePickerProps as ReactDatePickerProps,
} from "react-date-picker/dist/entry.nostyle";
import "./DatePicker.css";
import "./Calendar.css";

interface DatePickerProps extends ReactDatePickerProps {
  label?: string;
}

// TODO: keep eye on react-date-picker they plan to add portalContainer prop which will simplify calendar positioning
export const DatePicker = ({ label, ...props }: DatePickerProps) => {
  const { i18n } = useModifiedTranslation();
  const { positionedElementRefCallback, targetRefCallback } =
    usePositionElementToOtherElement();

  return (
    <div className="flex flex-col gap-0 w-full" ref={targetRefCallback}>
      {label && <label className="mb-1 text-sm font-normal">{label}</label>}
      <ReactDatePicker
        calendarIcon={<CalendarIcon />}
        clearIcon={null}
        className="px-2 pt-2 pb-1.5 text-base font-normal text-gray-500 bg-gray-50 rounded-lg border border-gray-300"
        locale={i18n.language}
        showLeadingZeros
        inputRef={positionedElementRefCallback}
        {...props}
      />
    </div>
  );
};

const usePositionElementToOtherElement = () => {
  const [targetNode, setTargetNode] = useState<HTMLElement>();

  const targetRefCallback = useCallback((node: HTMLElement | null) => {
    if (!node) {
      return;
    }
    setTargetNode(node);
  }, []);

  const positionedElementRefCallback = useCallback(
    (node: HTMLElement | null) => {
      if (!node || !targetNode) {
        return;
      }
      createPopper(targetNode, node, {
        placement: "bottom-start",
      });
    },
    [targetNode]
  );

  return {
    positionedElementRefCallback,
    targetRefCallback,
  };
};
