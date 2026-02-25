import { CountryFlag } from "components";

interface NameWithFlagProps {
  countryCode: string | undefined;
  name: string;
  showFlag?: boolean;
}

export const NameWithFlag = ({
  countryCode,
  name,
  showFlag = true,
}: NameWithFlagProps) => {
  return (
    <div className="text-lg md:text-base font-semibold leading-5 text-left text-gray-900 dark:text-gray-100">
      <span>{name}</span>
      {showFlag && (
        <CountryFlag
          code={countryCode}
          className="inline ml-1.5 align-baseline w-[20px] h-[14px]"
        />
      )}
    </div>
  );
};
