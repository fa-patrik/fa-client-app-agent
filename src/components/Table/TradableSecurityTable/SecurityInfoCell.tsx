import { CountryFlag } from "components";
import { Link, useParams } from "react-router-dom";

interface SecurityInfoProps {
  countryCode: string | undefined;
  securityId: number;
  name: string;
  isinCode: string | undefined;
  typeName: string;
}

const SecurityInfoCell = ({
  countryCode,
  securityId,
  name,
  isinCode,
  typeName,
}: SecurityInfoProps) => {
  const params = useParams();
  const contactId = params?.contactDbId;

  return (
    <div
      id={`seurityInfoCell-${securityId}`}
      className="flex flex-col text-xs text-black"
    >
      <div className="flex flex-row gap-x-1 items-center">
        <CountryFlag code={countryCode} />
        <span className="font-bold ">{name}</span>
        <Link
          onClick={(e) => e.stopPropagation()}
          id={`seurityInfoCell-link-${securityId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-lg font-bold text-primary-500 underline"
          to={`${
            contactId ? `impersonate/${contactId}` : ""
          }/holdings/${securityId}`}
        >
          ↗
        </Link>
      </div>
      <span id={`seurityInfoCell-isinCode-${securityId}`} className="text-xs">
        {isinCode}
      </span>
      <span id={`seurityInfoCell-typeName-${securityId}`} className="text-xs">
        {typeName}
      </span>
    </div>
  );
};

export default SecurityInfoCell;
