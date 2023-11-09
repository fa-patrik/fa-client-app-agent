import { Fragment } from "react";
import { RadioGroup } from "@headlessui/react";
import classNames from "classnames";

export interface Option {
  id: number | string;
  label: string;
}

interface ButtonRadioProps<T> {
  value: T | undefined;
  options: T[];
  onChange: (option: T) => void;
}

export const ButtonRadio = <TOption extends Option>({
  value,
  options,
  onChange,
}: ButtonRadioProps<TOption>) => {
  return (
    <RadioGroup
      value={value}
      onChange={onChange}
      className="flex items-center w-full font-medium text-gray-500 rounded border border-gray-300 divide-x text-normal"
    >
      {options.map((option) => (
        <RadioGroup.Option as={Fragment} value={option} key={option.id}>
          {({ checked }) => (
            <div
              className={classNames(
                "p-1.5 text-center grow cursor-pointer hover:bg-gray-100 focus:ring-0",
                {
                  "bg-primary-100 text-primary-600 hover:bg-primary-200":
                    checked || value?.id === option.id,
                }
              )}
            >
              {option.label}
            </div>
          )}
        </RadioGroup.Option>
      ))}
    </RadioGroup>
  );
};
