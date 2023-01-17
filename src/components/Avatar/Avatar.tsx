import { useGetContactInfo } from "api/initial/useGetContactInfo";
import classNames from "classnames";
import { useGetContractIdData } from "providers/ContractIdProvider";
import theme from "tailwindTheme";

interface AvatarProps {
  backgroundColor: string;
  initials: string;
  onClick?: () => void;
}

export const Avatar = ({ backgroundColor, initials, onClick }: AvatarProps) => {
  return (
    <div
      onClick={onClick}
      style={{ backgroundColor: backgroundColor }}
      className={classNames("flex justify-center items-center w-10 h-10 rounded-full",
        {
            "cursor-pointer": onClick
        }
      )}
    >
      <span className="text-xl font-bold text-center text-white">
        {initials}
      </span>
    </div>
  );
};

export const SelectedContactAvatar = () => {
  const { selectedContact } = useGetContractIdData();
  const { data: contactData } = useGetContactInfo();

  if (selectedContact && contactData) {
    const indexOfContact =
      contactData?.representees?.findIndex(
        (representee) => representee.id === selectedContact.id
      ) ?? 0;
    //default contact gets 0, and any rep start from 1
    const colorIndex = indexOfContact !== -1 ? indexOfContact + 1 : 0;
    const avatarColors = theme.colors.avatarColors;
    const selectedContactAvatarColor =
      avatarColors[
        ((colorIndex % avatarColors.length) + avatarColors.length) %
          avatarColors.length
      ];

    return (
      <Avatar
        backgroundColor={selectedContactAvatarColor}
        initials={selectedContact.initials.charAt(0)}
      />
    );
  }

  return null;
};
