import React, { ReactNode, Fragment, useState } from "react";
import { Combobox, Transition } from "@headlessui/react";
import { ReactComponent as ChevronDown } from "assets/chevron-down.svg";
import classNames from "classnames";
import { ConfirmDialog } from "components/Dialog/ConfirmDialog";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { filterOptionsByQuery } from "utils/filtering";
import { usePopper } from "../../hooks/usePopper";

const QuestionmarkIcon = () => {
  return (
    <svg
      className="stroke-gray-700 "
      width="18"
      height="18"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6.228 7C6.777 5.835 8.258 5 10 5C12.21 5 14 6.343 14 8C14 9.4 12.722 10.575 10.994 10.907C10.452 11.011 10 11.447 10 12M10 15H10.01M19 10C19 11.1819 18.7672 12.3522 18.3149 13.4442C17.8626 14.5361 17.1997 15.5282 16.364 16.364C15.5282 17.1997 14.5361 17.8626 13.4442 18.3149C12.3522 18.7672 11.1819 19 10 19C8.8181 19 7.64778 18.7672 6.55585 18.3149C5.46392 17.8626 4.47177 17.1997 3.63604 16.364C2.80031 15.5282 2.13738 14.5361 1.68508 13.4442C1.23279 12.3522 1 11.1819 1 10C1 7.61305 1.94821 5.32387 3.63604 3.63604C5.32387 1.94821 7.61305 1 10 1C12.3869 1 14.6761 1.94821 16.364 3.63604C18.0518 5.32387 19 7.61305 19 10Z"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export interface Option {
  id: number | string | null;
  label: string;
  subOptions?: Option[];
  OptionComponent?: ReactNode;
}

interface ComboBoxProps<T> {
  id?: string;
  value: T | undefined;
  onChange: (option: T) => void;
  options: T[];
  label?: string;
  /**
   * If given, enables a mobile-friendly tooltip next to the label.
   */
  tooltipContent?: string;
}

const renderOptions = (
  options: Option[],
  selectedOption: Option | undefined,
  level = 1
) => {
  const padding = level * 10;
  return options.map((option) => {
    const isSelected = selectedOption && selectedOption.id === option.id;
    return (
      <React.Fragment key={option.id}>
        <Combobox.Option value={option} as={Fragment}>
          {({ active }) => (
            <li
              className={classNames(
                "block py-2 pl-4 pr-4 text-sm text-gray-700 dark:text-gray-200 cursor-pointer select-none bg-white",
                {
                  "dark:text-white bg-primary-50 dark:bg-gray-600": active,
                  "font-bold": isSelected,
                }
              )}
              style={{ paddingLeft: `${padding}px` }}
            >
              {option.OptionComponent ?? option.label}
            </li>
          )}
        </Combobox.Option>
        {option?.subOptions &&
          renderOptions(option.subOptions, selectedOption, level + 1)}
      </React.Fragment>
    );
  });
};

export const ComboBox = <TOption extends Option>({
  id,
  options,
  value,
  onChange,
  label,
  tooltipContent,
}: ComboBoxProps<TOption>) => {
  const [query, setQuery] = useState("");
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
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const filteredOptions = filterOptionsByQuery(options, query);
  return (
    <>
      <Combobox id={id} as="div" value={value} onChange={onChange}>
        {label && (
          <div className="flex flex-row gap-x-2">
            <Combobox.Label className="text-sm font-normal">
              {label}
            </Combobox.Label>
            {tooltipContent && (
              <>
                <div
                  id={`${id}-toolTipDialogButton`}
                  className="cursor-help"
                  onClick={() => setConfirmDialogOpen(true)}
                >
                  <QuestionmarkIcon />
                </div>
              </>
            )}
          </div>
        )}
        <div
          ref={trigger}
          className="flex gap-2 items-center py-2.5 pr-4 w-full h-10 bg-gray-50 rounded-lg border focus-within:border-2 border-gray-300 focus-within:border-primary-400"
        >
          <Combobox.Input
            className="p-2.5 w-full h-10 text-sm text-gray-900 truncate bg-transparent rounded-lg border-0 focus:border-0 focus:ring-0 focus:-m-[1px]"
            displayValue={(option: TOption) =>
              option?.label ?? t("component.select.placeholder")
            }
            onChange={(event) => setQuery(event.target.value)}
          />
          <Combobox.Button className="">
            <ChevronDown className="stroke-gray-500 w-[20px] h-[20px]" />
          </Combobox.Button>
        </div>
        <div ref={container}>
          <Transition
            enter="transition duration-100 ease-out"
            enterFrom="transform scale-95 opacity-0"
            enterTo="transform scale-100 opacity-100"
            leave="transition duration-75 ease-out"
            leaveFrom="transform scale-100 opacity-100"
            leaveTo="transform scale-95 opacity-0"
          >
            <Combobox.Options className="overflow-y-auto py-1 max-h-96 text-base list-none bg-white rounded divide-y divide-gray-100 shadow">
              {renderOptions(filteredOptions, value)}
            </Combobox.Options>
          </Transition>
        </div>
      </Combobox>
      {tooltipContent && (
        <ConfirmDialog
          title="Information"
          description={tooltipContent}
          cancelButtonText="Close"
          isOpen={confirmDialogOpen}
          setIsOpen={setConfirmDialogOpen}
        />
      )}
    </>
  );
};
