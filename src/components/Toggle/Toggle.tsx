import { Dispatch, Fragment, SetStateAction } from "react";
import { Switch } from "@headlessui/react";

type ToggleProps = {
  enabled: boolean;
  setEnabled: Dispatch<SetStateAction<boolean>>;
  label?: string;
};

const Toggle = ({ enabled, setEnabled, label }: ToggleProps) => {
  return (
    <Switch checked={enabled} onChange={setEnabled} as={Fragment}>
      {({ checked }) => (
        <div className="flex flex-row gap-x-1 cursor-pointer">
          <button
            className={`${
              checked ? "bg-primary-500" : "bg-gray-200"
            } relative inline-flex h-5 w-9 items-center rounded-full`}
          >
            <span
              className={`${
                checked ? "translate-x-4" : "translate-x-1"
              } inline-block h-4 w-4 transform rounded-full bg-white transition`}
            />
          </button>
          <span className={`${!checked ? "opacity-50" : ""}`}>{label}</span>
        </div>
      )}
    </Switch>
  );
};
export default Toggle;
