import { ReactNode, Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { ReactComponent as ChevronDown } from "assets/chevron-down.svg";
import classNames from "classnames";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { usePopper } from "../../hooks/usePopper";

export interface Option {
  id: number | string | null;
  label: string;
  OptionComponent?: ReactNode;
}

interface SelectProps<T> {
  value: T | undefined;
  onChange: (option: T) => void;
  options: T[];
  label?: string;
}

export const Select = <TOption extends Option>({
  options,
  value,
  onChange,
  label,
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
  return (
    <Listbox as="div" value={value} onChange={onChange}>
      {label && (
        <Listbox.Label className="text-sm font-normal">{label}</Listbox.Label>
      )}
      <Listbox.Button
        className="flex gap-2 items-center py-2.5 px-4 w-full h-10 text-lg font-bold text-gray-900 bg-gray-50 rounded-lg border border-gray-300"
        ref={trigger}
      >
        <div className="box-border flex-1 content-start leading-none text-left truncate">
          {value?.label ?? t("component.select.placeholder")}
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
          <Listbox.Options className="py-1 text-base list-none bg-white rounded divide-y divide-gray-100 shadow ">
            {options.map((option) => (
              <Listbox.Option key={option.id} value={option} as={Fragment}>
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
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
};
