import React, { ReactNode, Fragment, useState, useEffect } from "react";
import { Combobox, Transition } from "@headlessui/react";
import { ReactComponent as ChevronDown } from "assets/chevron-down.svg";
import { ReactComponent as InfoIcon } from "assets/information-circle.svg";
import classNames from "classnames";
import { ConfirmDialog } from "components/Dialog/ConfirmDialog";
import { LoadingIndicator } from "components/LoadingIndicator/LoadingIndicator";
import Fade from "components/Transition/Fade";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { filterOptionsByQuery, getHeightClass } from "utils/options";
import { usePopper } from "../../hooks/usePopper";

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
  options: T[] | undefined;
  label?: string;
  disabled?: boolean;
  loading?: boolean;
  /**
   * If given, enables a mobile-friendly tooltip next to the label.
   */
  tooltipContent?: string;
  error?: string;
  height?: string;
}

const renderOptions = (
  options: Option[],
  selectedOption: Option | undefined,
  id?: string,
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
              data-testid={id ? `${id}-${option.id}` : undefined}
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
          renderOptions(option.subOptions, selectedOption, id, level + 1)}
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
  disabled,
  error,
  loading,
  height,
}: ComboBoxProps<TOption>) => {
  const [defaultHeight, setDefaultHeight] = useState("h-48");
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
  const isDisabled = disabled || options?.length === 0 || loading;

  //reset query on undefined or an option with empty label
  useEffect(() => {
    if (value === undefined || value.label === "") {
      setQuery("");
    }
  }, [value]);

  useEffect(() => {
    // Function to update height state
    const updateHeight = () => {
      const screenHeight = window.innerHeight;
      const heightClass = getHeightClass(screenHeight);
      setDefaultHeight(heightClass);
    };

    // Update height state on mount
    updateHeight();

    // Add event listener for resize event
    window.addEventListener("resize", updateHeight);

    // Remove event listener on unmount
    return () => {
      window.removeEventListener("resize", updateHeight);
    };
  }, []);

  return (
    <div className="flex flex-col">
      <Combobox
        id={id}
        as="div"
        value={value}
        onChange={onChange}
        disabled={isDisabled}
      >
        {label && (
          <div className="flex flex-row gap-x-2">
            <Combobox.Label
              id={!id ? undefined : `${id}-label`}
              className="text-sm font-normal"
            >
              {label}
            </Combobox.Label>
            {tooltipContent && (
              <div
                id={!id ? undefined : `${id}-tooltipDialogButton`}
                className="cursor-help"
                onClick={() => setConfirmDialogOpen(true)}
              >
                <InfoIcon />
              </div>
            )}
          </div>
        )}
        <div
          ref={trigger}
          className={classNames(
            "flex gap-2 items-center py-2.5 pr-4 w-full h-10 bg-gray-50 rounded-lg border focus-within:border-2 border-gray-300 focus-within:border-primary-400",
            {
              "border-2 border-red-500 focus-within:border-red-500": error,
            }
          )}
        >
          <Combobox.Input
            id={!id ? undefined : `${id}-input`}
            className="p-2.5 w-full h-10 text-sm text-gray-900 truncate bg-transparent rounded-lg border-0 focus:border-0 focus:ring-0 focus:-m-[1px]"
            displayValue={(option: TOption) =>
              option?.label ?? t("component.select.placeholder")
            }
            onChange={(event) => setQuery(event.target.value)}
          />
          <Combobox.Button
            id={!id ? undefined : `${id}-button`}
            className={classNames("", {
              "border-gray-200 text-gray-300 cursor-not-allowed": isDisabled,
            })}
          >
            {loading ? (
              <LoadingIndicator size="xs" />
            ) : (
              <ChevronDown className="stroke-gray-500 w-[20px] h-[20px]" />
            )}
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
            <Combobox.Options
              className={`overflow-y-auto py-1 text-base list-none bg-white rounded divide-y divide-gray-100 shadow ${
                height ?? defaultHeight
              }`}
            >
              {renderOptions(filteredOptions, value, id)}
            </Combobox.Options>
          </Transition>
        </div>
      </Combobox>
      {error && (
        <Fade>
          <small className="mt-2 text-red-500">{error}</small>
        </Fade>
      )}
      {tooltipContent && (
        <ConfirmDialog
          id={!id ? undefined : `${id}-tooltipDialog`}
          title={t("component.select.dialogTitle")}
          description={tooltipContent}
          cancelButtonText={t("component.select.dialogCloseButtonLabel")}
          isOpen={confirmDialogOpen}
          setIsOpen={setConfirmDialogOpen}
        />
      )}
    </div>
  );
};
