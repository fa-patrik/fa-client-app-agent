import { Dispatch, SetStateAction } from "react";
import classNames from "classnames";

interface SelectGridProps {
  id: string;
  selectBoxes: { id: string; label: string }[];
  onSelect: Dispatch<SetStateAction<Record<string, boolean>>>;
  selected: Record<string, boolean>;
  disabled?: boolean;
  narrow?: boolean;
}

const SelectGrid = ({
  id,
  selectBoxes,
  onSelect,
  selected,
  disabled,
  narrow,
}: SelectGridProps) => {
  return (
    <ul
      id={id}
      className={classNames(
        "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 py-2",
        {
          "grid-cols-3": narrow,
          "grid-cols-2 gap-x-4 gap-y-4": !narrow,
        }
      )}
    >
      {selectBoxes.map((selectBox) => (
        <li key={selectBox.id} className="flex justify-start">
          <label
            id={`${id}-label-${selectBox.id}`}
            className={classNames(
              "flex gap-x-2 items-center py-2 px-3 w-full text-xs select-none truncate",
              {
                "ring-1 ring-gray-400":
                  !narrow && selected[selectBox.id] === false,
                "ring-1 ring-green-500":
                  !narrow && selected[selectBox.id] === true,
                "ring-0 rounded-none": narrow,
                "rounded-full": !narrow,
                "cursor-pointer": !disabled,
              }
            )}
          >
            <input
              id={`${id}-input-${selectBox.id}`}
              disabled={disabled}
              onChange={(event) =>
                onSelect((prev) => ({
                  ...prev,
                  [selectBox.id]: event.target.checked,
                }))
              }
              className="w-5 h-5 text-green-500 rounded-full"
              checked={selected[selectBox.id]}
              type="checkbox"
            ></input>
            {selectBox.label}
          </label>
        </li>
      ))}
    </ul>
  );
};

export default SelectGrid;
