import { ReactComponent as Spinner } from "assets/spinner.svg";
import classNames from "classnames";
interface AvatarProps {
  backgroundColor: string;
  initials: string;
  onClick?: () => void;
  loading?: boolean;
}

export const Avatar = ({
  backgroundColor,
  initials,
  onClick,
  loading,
}: AvatarProps) => {
  return (
    <div
      onClick={onClick}
      style={{ backgroundColor: backgroundColor }}
      className={classNames(
        "flex justify-center items-center w-10 h-10 rounded-full",
        {
          "cursor-pointer": onClick,
        }
      )}
    >
      {loading ? (
        <Spinner className=" text-gray-200 animate-spin fill-primary-600" />
      ) : (
        <span className="text-xl font-bold text-center text-white">
          {initials}
        </span>
      )}
    </div>
  );
};
