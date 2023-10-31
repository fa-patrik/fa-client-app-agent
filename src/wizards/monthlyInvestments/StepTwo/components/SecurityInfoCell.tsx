import { CountryFlag } from "components";
import { Link } from "react-router-dom";

interface SecurityInfoProps {
  countryCode: string | undefined;
  securityId: number;
  name: string;
  isinCode: string | null;
  typeName: string;
  id?: string;
}

const SecurityInfoCell = ({
  countryCode,
  securityId,
  name,
  isinCode,
  typeName,
  id,
}: SecurityInfoProps) => {
  return (
    <div id={id} className="flex flex-col text-xs text-black">
      <div className="flex flex-row gap-x-1 items-center">
        <CountryFlag code={countryCode} />
        <span className="font-bold" id={id ? `${id}-name` : undefined}>
          {name}
        </span>
        <Link
          onClick={(e) => {
            e.stopPropagation();
          }}
          id={id ? `${id}-linkToHoldings` : undefined}
          target="_blank"
          rel="noopener noreferrer"
          className="text-lg font-bold text-primary-500 underline"
          to={`../holdings/${securityId}`}
        >
          ↗
        </Link>
      </div>
      <span id={id ? `${id}-isinCode` : undefined} className="text-xs">
        {isinCode}
      </span>
      <span id={id ? `${id}-typeName` : undefined} className="text-xs">
        {typeName}
      </span>
    </div>
  );
};

export default SecurityInfoCell;
