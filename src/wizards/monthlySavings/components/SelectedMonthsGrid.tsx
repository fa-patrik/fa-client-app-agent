import { Dispatch, SetStateAction, useMemo } from "react";
import SelectGrid from "components/SelectGrid/SelectGrid";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";

const months = Array(12)
  .fill(undefined)
  .map((_, idx) => {
    return idx;
  });

interface Props {
  id?: string;
  selected: Record<number, boolean>;
  disabled?: boolean;
  narrow?: boolean;
  onSelect?: Dispatch<SetStateAction<Record<string, boolean>>>;
}

export const SelectMonthsGrid = ({
  id,
  selected,
  disabled,
  onSelect,
  narrow,
}: Props) => {
  const { i18n } = useModifiedTranslation();
  const selectBoxes = useMemo(
    () =>
      months.map((dateNr) => {
        const date = new Date();
        date.setMonth(dateNr);
        return {
          id: `${dateNr + 1}`,
          label: date.toLocaleString(i18n.language, {
            month: "long",
          }),
        };
      }),
    [i18n.language]
  );
  return (
    <SelectGrid
      id={id ?? "selectedMonthsGrid"}
      disabled={disabled}
      onSelect={onSelect}
      narrow={narrow}
      selected={selected}
      selectBoxes={selectBoxes}
    />
  );
};
