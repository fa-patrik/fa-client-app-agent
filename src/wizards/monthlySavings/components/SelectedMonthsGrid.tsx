import { Dispatch, SetStateAction, useMemo } from "react";
import SelectGrid from "components/SelectGrid/SelectGrid";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";

export const months: number[] = Array.from({ length: 12 }, (_, i) => i + 1);

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
  const { t } = useModifiedTranslation();
  const selectBoxes = useMemo(
    () =>
      months.map((dateNr) => {
        return {
          id: `${dateNr}`,
          label: t(`utils.months.${dateNr}`),
        };
      }),
    [t]
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
