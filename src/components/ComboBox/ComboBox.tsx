import { ReactNode, Fragment, useState } from "react";
import { Combobox, Transition } from "@headlessui/react";
import { ReactComponent as ChevronDown } from "assets/chevron-down.svg";
import classNames from "classnames";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { usePopper } from "../../hooks/usePopper";

export interface Option {
  id: number | string | null;
  label: string;
  OptionComponent?: ReactNode;
}

interface ComboBoxProps<T> {
  value: T | undefined;
  onChange: (option: T) => void;
  options: T[];
  label?: string;
}

export const ComboBox = <TOption extends Option>({
  options,
  value,
  onChange,
  label,
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

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Combobox as="div" value={value} onChange={onChange}>
      {label && (
        <Combobox.Label className="text-sm font-normal">{label}</Combobox.Label>
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
            {filteredOptions.map((option) => (
              <Combobox.Option key={option.id} value={option} as={Fragment}>
                {({ active, selected }) => (
                  <li
                    className={classNames(
                      "block py-2 px-4 text-sm text-gray-700 dark:text-gray-200 cursor-pointer select-none",
                      {
                        "dark:text-white bg-primary-50 dark:bg-gray-600":
                          active,
                        "font-bold": selected,
                      }
                    )}
                  >
                    {option.OptionComponent ?? option.label}
                  </li>
                )}
              </Combobox.Option>
            ))}
          </Combobox.Options>
        </Transition>
      </div>
    </Combobox>
  );
};
