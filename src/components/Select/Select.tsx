import React, { ReactNode, Fragment, useMemo } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { ReactComponent as CheckIcon } from "assets/check.svg";
import { ReactComponent as ChevronDown } from "assets/chevron-down.svg";
import classNames from "classnames";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { usePopper } from "../../hooks/usePopper";

function truncateLabel(label: string) {
  const MAX_LABEL_LENGTH = 18;
  const TRUNCATION_LENGTH = 12;

  return label.length > MAX_LABEL_LENGTH
    ? label.slice(0, TRUNCATION_LENGTH).trimEnd() + "..."
    : label;
}

export interface Option {
  id: number | string | null;
  label: string;
  count?: number;
  subOptions?: Option[];
  OptionComponent?: ReactNode;
}

interface SelectProps<T> {
  value: T[] | T | undefined;
  /** Only used if selectMultiple is false */
  onChange?: (option: T) => void;
  /** Only used if selectMultiple is true */
  onChangeMultiple?: (option: T[]) => void;
  options: T[];
  label?: string;
  /** If true, the user can select multiple options */
  selectMultiple?:
    | boolean
    | {
        /** If true, selected options will be displayed in the button
         * If false, only the initial label will be displayed
         * @default false
         */
        listSelectedOptions?: boolean;
      };
}

/**
 * Recursively renders a list of options and their sub-options.
 * Increases the padding for each sub-option level.
 * @param {Option[]} options - The list of options to render.
 * @param {number} [level=1] - The current sub-option level. Defaults to 1.
 * @param {boolean} [selectMultiple=false] - If true, the user can select multiple options.
 * @returns {React.ReactNode} The rendered list of options and sub-options.
 */
const renderOptions = ({
  options = [] as Option[],
  level = 1,
  enableMultiselect = false,
}) => {
  const padding = level * 10;
  return options.map((option) => {
    return (
      <React.Fragment key={option.id}>
        <Listbox.Option value={option} as={Fragment}>
          {({ active, selected }) => (
            <li
              className={classNames(
                "relative block py-2 pl-4 pr-4 text-sm text-gray-700 dark:text-gray-200 cursor-pointer select-none bg-white",
                {
                  "dark:text-white bg-primary-50 dark:bg-gray-600": active,
                  "font-bold": selected,
                }
              )}
              style={{ paddingLeft: `${padding}px` }}
            >
              {option.OptionComponent ?? option.label}
              {enableMultiselect && (
                <div
                  className={`absolute inset-y-0 right-0 pr-3 flex items-center space-x-2`}
                >
                  {option.count && <span>{option.count}</span>}
                  <span>{selected && <CheckIcon />}</span>
                </div>
              )}
            </li>
          )}
        </Listbox.Option>
        {option?.subOptions &&
          renderOptions({
            options: option.subOptions,
            level: level + 1,
            enableMultiselect,
          })}
      </React.Fragment>
    );
  });
};

export const Select = <TOption extends Option>({
  options,
  value,
  onChange,
  onChangeMultiple,
  label,
  selectMultiple = false,
}: SelectProps<TOption>) => {
  const { t } = useModifiedTranslation();
  const [trigger, container] = usePopper({
    placement: "bottom-start",
    modifiers: [
      {
        name: "sameWidth",
        enabled: true,
        phase: "beforeWrite",
        fn({ state }) {
          state.styles.popper.width = `${state.rects.reference.width}px`;
        },
        requires: ["computeStyles"],
        effect: ({ state }) => {
          if (state.elements.reference instanceof Element) {
            // fake scroll event to recalculate popper position in case there is animation
            setTimeout(() => {
              dispatchEvent(new CustomEvent("scroll"));
            }, 500);
            state.elements.popper.style.width = `${state.elements.reference.clientWidth}px`;
          }
        },
      },
    ],
  });

  const { enableMultiselect, listSelectedOptions } = useMemo(() => {
    if (typeof selectMultiple === "object") {
      return {
        enableMultiselect: true,
        listSelectedOptions: selectMultiple?.listSelectedOptions ?? false,
      };
    }
    return {
      enableMultiselect: selectMultiple,
      listSelectedOptions: false,
    };
  }, [selectMultiple]);

  const listBoxButtonContent = useMemo(() => {
    if (Array.isArray(value)) {
      if (listSelectedOptions && value.length > 0) {
        return `(${value.length}) ${value
          .map(({ label }) => truncateLabel(label))
          .join(", ")}`;
      } else {
        return (
          `(${value.length}) ${label}` || t("component.select.placeholder")
        );
      }
    } else {
      return value?.label ?? t("component.select.placeholder");
    }
  }, [value, label, listSelectedOptions, t]);

  const selectButtonDisabled = options.length === 0;

  return (
    <Listbox
      as="div"
      value={value}
      disabled={selectButtonDisabled}
      onChange={(v: TOption | TOption[]) =>
        Array.isArray(v) ? onChangeMultiple?.(v) : onChange?.(v)
      }
      by={selectMultiple ? "label" : undefined}
      multiple={enableMultiselect}
    >
      {label && (!enableMultiselect || listSelectedOptions) && (
        <Listbox.Label className="text-sm font-normal">{label}</Listbox.Label>
      )}
      <Listbox.Button
        className={classNames(
          "flex gap-2 items-center py-2.5 px-4 w-full h-10 text-base text-gray-900 bg-gray-50 rounded-lg border border-gray-300",
          {
            "border-gray-200 text-gray-300": selectButtonDisabled,
          }
        )}
        ref={trigger}
      >
        <div className="box-border flex-1 content-start leading-none text-left truncate">
          {listBoxButtonContent}
        </div>
        <ChevronDown className="stroke-gray-500 w-[20px] h-[20px]" />
      </Listbox.Button>
      <div ref={container}>
        <Transition
          enter="transition duration-100 ease-out"
          enterFrom="transform scale-95 opacity-0"
          enterTo="transform scale-100 opacity-100"
          leave="transition duration-75 ease-out"
          leaveFrom="transform scale-100 opacity-100"
          leaveTo="transform scale-95 opacity-0"
        >
          <Listbox.Options className="overflow-y-auto py-1 max-h-96 text-base list-none bg-white rounded divide-y divide-gray-100 shadow">
            {renderOptions({ options, enableMultiselect })}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
};
